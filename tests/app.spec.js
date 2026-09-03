// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Brevete Perú - Examen de Reglas', () => {

  test('la página de inicio carga sin errores de consola y muestra los 4 accesos', async ({ page }) => {
    const consoleErrors = [];
    page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
    page.on('pageerror', err => consoleErrors.push(err.message));

    await page.goto('/index.html');
    await expect(page.locator('.hero h1')).toHaveText(/Prepárate para tu examen/);
    await expect(page.locator('.action-card')).toHaveCount(4);
    await expect(page.locator('.action-card', { hasText: 'Estudiar' })).toBeVisible();
    await expect(page.locator('.action-card', { hasText: 'Simulacro de examen' })).toBeVisible();
    await expect(page.locator('.action-card', { hasText: 'Refuerzo de fallos' })).toBeVisible();
    await expect(page.locator('.action-card', { hasText: 'Estadísticas' })).toBeVisible();
    // stats start at 0
    await expect(page.locator('.hero-stat .big').first()).toHaveText('0%');

    expect(consoleErrors, `Errores de consola: ${consoleErrors.join(' | ')}`).toEqual([]);
  });

  test('modo estudio: responde correcto e incorrecto y muestra retroalimentación', async ({ page }) => {
    await page.goto('/index.html');
    await page.click('[data-nav="study-setup"]');
    await expect(page.locator('h2')).toHaveText('Modo estudio');

    // 5 preguntas, sin tiempo (default)
    await page.click('.chip-group[data-group="count"] .chip[data-val="10"]');
    await page.click('[data-action="start-study"]');

    await expect(page.locator('.q-card')).toBeVisible();

    for (let i = 0; i < 10; i++) {
      await expect(page.locator('.progress-label')).toContainText(`${i + 1}/10`);
      const options = page.locator('.opt-btn');
      await expect(options).toHaveCount(4);

      // click first option
      await options.nth(0).click();

      // feedback must appear (either ok or bad) with exactly one correct highlighted
      await expect(page.locator('.feedback')).toBeVisible();
      await expect(page.locator('.opt-btn.correct')).toHaveCount(1);
      const wrongCount = await page.locator('.opt-btn.wrong').count();
      expect(wrongCount).toBeLessThanOrEqual(1);

      // options should no longer be clickable to change answer (disabled) except in exam mode
      await expect(options.nth(1)).toBeDisabled();

      const nextBtn = page.locator('[data-action="next-question"]');
      await expect(nextBtn).toBeVisible();
      await nextBtn.click();
    }

    // after last question -> session summary
    await expect(page.locator('.results-card h2')).toHaveText('Ronda completada');
    await expect(page.locator('.score-circle span')).toHaveText(/\d+\/10/);
  });

  test('el ícono de señal (imagen real o SVG de respaldo) se renderiza cuando la pregunta tiene una señal asociada', async ({ page }) => {
    await page.goto('/index.html');
    await page.click('[data-nav="study-setup"]');
    await page.click('.chip-group[data-group="filter"] .chip[data-val="senales"]');
    await page.click('.chip-group[data-group="count"] .chip[data-val="10"]');
    await page.click('[data-action="start-study"]');

    // En modo "solo señales" cada pregunta debe traer un sign-box con una imagen real
    // (assets/signs|diagrams/*.png) o, si no existe imagen fuente (ej. R-6), un <svg> de respaldo.
    const media = page.locator('.sign-box img.sign-img, .sign-box svg');
    await expect(media).toBeVisible();
  });

  test('las imágenes de señales extraídas del balotario cargan correctamente (sin 404)', async ({ page }) => {
    await page.goto('/index.html');
    await page.click('[data-nav="study-setup"]');
    await page.click('.chip-group[data-group="filter"] .chip[data-val="senales"]');
    await page.click('.chip-group[data-group="count"] .chip[data-val="40"]');
    await page.click('[data-action="start-study"]');

    const failedImgSrcs = [];
    for (let i = 0; i < 40; i++) {
      const img = page.locator('.sign-box img.sign-img');
      if (await img.count()) {
        // espera a que termine de cargar (o falle) antes de leer naturalWidth
        const { src, ok } = await img.evaluate(el => new Promise(resolve => {
          const finish = () => resolve({ src: el.src, ok: el.naturalWidth > 0 });
          if (el.complete) return finish();
          el.addEventListener('load', finish, { once: true });
          el.addEventListener('error', finish, { once: true });
        }));
        if (!ok) failedImgSrcs.push(src);
      }
      await page.locator('.opt-btn').first().click();
      if (i < 39) await page.click('[data-action="next-question"]');
    }
    expect(failedImgSrcs, `Imágenes que no cargaron: ${failedImgSrcs.join(', ')}`).toEqual([]);
  });

  test('simulacro de examen: 40 preguntas, navegador funcional, resultados con aprobado/no aprobado', async ({ page }) => {
    await page.goto('/index.html');
    await page.click('[data-nav="exam-setup"]');
    await expect(page.locator('h2')).toHaveText('Simulacro de examen');
    await page.click('[data-action="start-exam"]');

    // 40 casillas del navegador
    await expect(page.locator('.navdot')).toHaveCount(40);
    await expect(page.locator('.progress-label')).toContainText('0/40 respondidas');

    // responder las 40 preguntas seleccionando la opción A cada vez, usando "Siguiente"
    for (let i = 0; i < 40; i++) {
      await page.locator('.opt-btn').nth(0).click();
      if (i < 39) {
        await page.click('[data-action="next-question-exam"]');
      }
    }
    await expect(page.locator('.progress-label')).toContainText('40/40 respondidas');

    // finalizar examen -> modal de confirmación propio (no confirm() nativo)
    await page.click('[data-action="finish-exam-confirm"]');
    await expect(page.locator('.modal-box')).toBeVisible();
    await page.click('.modal-box [data-modal="ok"]');

    // pantalla de resultados
    await expect(page.locator('.pass-banner')).toBeVisible();
    const banner = await page.locator('.pass-banner').textContent();
    expect(banner).toMatch(/APROBADO|NO APROBADO/);
    await expect(page.locator('.score-circle span')).toHaveText(/\d+\/40/);
    await expect(page.locator('.review-row')).toHaveCount(40);
  });

  test('refuerzo de fallos: aparecen preguntas pendientes tras fallar un examen', async ({ page }) => {
    await page.goto('/index.html');

    // fuerza que TODAS las respuestas del examen sean incorrectas para generar fallos:
    // seleccionamos siempre la última opción (d) que rara vez es la correcta, y confirmamos vía DOM cuál falló.
    await page.click('[data-nav="exam-setup"]');
    await page.click('[data-action="start-exam"]');
    for (let i = 0; i < 40; i++) {
      await page.locator('.opt-btn').nth(3).click();
      if (i < 39) await page.click('[data-action="next-question-exam"]');
    }
    await page.click('[data-action="finish-exam-confirm"]');
    await page.click('.modal-box [data-modal="ok"]');
    await expect(page.locator('.pass-banner')).toBeVisible();

    // ir a refuerzo: debe haber preguntas pendientes / con fallos
    await page.click('[data-nav="reinforce-setup"]');
    await expect(page.locator('h2')).toHaveText('Refuerzo de fallos');
    const dueBig = await page.locator('.hero-stat .big').first().textContent();
    expect(Number(dueBig)).toBeGreaterThan(0);

    await page.click('.chip-group[data-group="count"] .chip[data-val="10"]');
    await page.click('[data-action="start-reinforce"]');
    await expect(page.locator('.q-card')).toBeVisible();
    await expect(page.locator('.progress-label')).toContainText('Refuerzo · 1/10');
  });

  test('temporizador por pregunta: al agotarse el tiempo revela la respuesta automáticamente', async ({ page }) => {
    await page.goto('/index.html');
    await page.click('[data-nav="study-setup"]');
    await page.click('.chip-group[data-group="count"] .chip[data-val="10"]');
    await page.click('.chip-group[data-group="timer"] .chip[data-val="20"]');
    await page.click('[data-action="start-study"]');

    await expect(page.locator('#qRing')).toBeVisible();
    // esperar a que el tiempo se agote (20s + margen)
    await expect(page.locator('.feedback')).toBeVisible({ timeout: 25000 });
    const text = await page.locator('.feedback').textContent();
    expect(text).toMatch(/Correcto|Incorrecto|Sin respuesta/);
  });

  test('estadísticas reflejan el progreso y persisten tras recargar la página', async ({ page }) => {
    await page.goto('/index.html');
    await page.click('[data-nav="study-setup"]');
    await page.click('.chip-group[data-group="count"] .chip[data-val="10"]');
    await page.click('[data-action="start-study"]');
    for (let i = 0; i < 10; i++) {
      await page.locator('.opt-btn').nth(0).click();
      await page.click('[data-action="next-question"]');
    }

    await page.click('[data-nav="stats"]');
    await expect(page.locator('h2')).toHaveText('Estadísticas');
    const attempted = await page.locator('.hero-stat .big').nth(0).textContent();
    expect(attempted).toMatch(/^\d+\/200$/);
    expect(attempted.startsWith('0/')).toBeFalsy();

    // recargar y verificar persistencia via localStorage
    await page.reload();
    await page.click('[data-nav="stats"]');
    const attemptedAfterReload = await page.locator('.hero-stat .big').nth(0).textContent();
    expect(attemptedAfterReload).toEqual(attempted);
  });

  test('reiniciar progreso limpia las estadísticas mediante el modal propio', async ({ page }) => {
    await page.goto('/index.html');
    await page.click('[data-nav="study-setup"]');
    await page.click('.chip-group[data-group="count"] .chip[data-val="10"]');
    await page.click('[data-action="start-study"]');
    await page.locator('.opt-btn').nth(0).click();
    await page.click('[data-nav="stats"]');

    await page.click('[data-action="reset-progress"]');
    await expect(page.locator('.modal-box')).toBeVisible();
    await page.click('.modal-box [data-modal="ok"]');

    // vuelve a inicio con estadísticas en cero
    await expect(page.locator('.hero-stat .big').first()).toHaveText('0%');
    const stored = await page.evaluate(() => localStorage.getItem('brevete_v1'));
    const parsed = JSON.parse(stored);
    expect(Object.keys(parsed.perQuestion).length).toBe(0);
    expect(parsed.examHistory.length).toBe(0);
  });

  test('selector de categoría cambia el banco de preguntas y persiste tras recargar', async ({ page }) => {
    await page.goto('/index.html');
    await expect(page.locator('.brand-sub')).toHaveText('Clase A · Categoría I');
    const totalCatI = await page.locator('.hero-stat .big').nth(1).textContent();
    expect(totalCatI).toContain('/200');

    await page.click('[data-action="set-category"][data-arg="3c"]');
    await expect(page.locator('.brand-sub')).toHaveText('Clase A · Categoría III-C');
    const totalCatIII = await page.locator('.hero-stat .big').nth(1).textContent();
    expect(totalCatIII).toContain('/339');

    await page.reload();
    await expect(page.locator('.brand-sub')).toHaveText('Clase A · Categoría III-C');
    await expect(page.locator('.chip[data-arg="3c"]')).toHaveClass(/active/);
  });

  test('preguntas de rótulos de mercancías peligrosas (III-C) muestran imágenes como alternativas', async ({ page }) => {
    await page.goto('/index.html');
    await page.click('[data-action="set-category"][data-arg="3c"]');
    await page.click('[data-nav="study-setup"]');
    await page.click('.chip-group[data-group="count"] .chip[data-val="9999"]');
    await page.click('[data-action="start-study"]');

    let found = false;
    for (let i = 0; i < 339 && !found; i++) {
      if (await page.locator('.options.img-options').count()) {
        found = true;
        const imgs = page.locator('.options.img-options .opt-thumb');
        const n = await imgs.count();
        expect(n).toBeGreaterThan(0);
        for (let j = 0; j < n; j++) {
          const ok = await imgs.nth(j).evaluate(el => new Promise(resolve => {
            const finish = () => resolve(el.naturalWidth > 0);
            if (el.complete) return finish();
            el.addEventListener('load', finish, { once: true });
            el.addEventListener('error', finish, { once: true });
          }));
          expect(ok).toBe(true);
        }
        await page.locator('.opt-btn').first().click();
        await expect(page.locator('.correct-note')).toBeVisible();
        break;
      }
      if (await page.locator('.opt-btn').count()) await page.locator('.opt-btn').first().click();
      const nextBtn = page.locator('[data-action="next-question"]');
      if (await nextBtn.count()) await nextBtn.click();
    }
    expect(found).toBe(true);
  });

  test('recupera una sesión de estudio interrumpida al recargar', async ({ page }) => {
    await page.goto('/index.html');
    await page.click('[data-nav="study-setup"]');
    await page.click('.chip-group[data-group="count"] .chip[data-val="10"]');
    await page.click('[data-action="start-study"]');

    // responde 3 de las 10 preguntas
    for (let i = 0; i < 3; i++) {
      await page.locator('.opt-btn').first().click();
      await page.click('[data-action="next-question"]');
    }
    await expect(page.locator('.progress-label')).toContainText('4/10');

    // recarga sin salir explícitamente (simula cierre/recarga accidental)
    await page.reload();

    await expect(page.locator('#resumeBanner')).toBeVisible();
    await expect(page.locator('#resumeBanner')).toContainText('Modo estudio');
    await expect(page.locator('#resumeBanner')).toContainText('4 de 10');

    await page.click('[data-action="resume-session"]');
    await expect(page.locator('.q-card')).toBeVisible();
    await expect(page.locator('.progress-label')).toContainText('4/10');

    // termina la ronda y confirma que la sesión guardada se limpia
    for (let i = 0; i < 7; i++) {
      await page.locator('.opt-btn').first().click();
      await page.click('[data-action="next-question"]');
    }
    await expect(page.locator('.results-card')).toBeVisible();
    const saved = await page.evaluate(() => localStorage.getItem('brevete_session'));
    expect(saved).toBeNull();
  });

  test('descarta una sesión guardada sin reanudarla', async ({ page }) => {
    await page.goto('/index.html');
    await page.click('[data-nav="study-setup"]');
    await page.click('[data-action="start-study"]');
    await page.locator('.opt-btn').first().click();
    await page.click('[data-action="next-question"]');
    await page.reload();

    await expect(page.locator('#resumeBanner')).toBeVisible();
    await page.click('[data-action="discard-session"]');
    await expect(page.locator('#resumeBanner')).toHaveCount(0);
    const saved = await page.evaluate(() => localStorage.getItem('brevete_session'));
    expect(saved).toBeNull();
  });
});
