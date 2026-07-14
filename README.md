# Redi — ¿Dónde están los peces? 🐟

Archivos sueltos en un único nivel (sin carpetas), porque el
drag-and-drop de GitHub venía aplanando la estructura de todas formas.

## Cómo subir esto a GitHub

1. Borrá lo que haya en el repositorio actual.
2. Seleccioná TODOS los archivos de esta carpeta (Ctrl+A / Cmd+A) y
   arrastralos al recuadro de "Add file → Upload files" de GitHub.
3. Commit changes.
4. Settings → Pages → Deploy from branch → main → / (root) → Save.

## Nombres de página (importante)

Las páginas de intento (donde NO se puede atrapar nada) ahora se
llaman `mar_pesca1`, `mar_pesca2`, `mar_pesca3`, `mar_pesca4`. La
página donde sí se puede pescar es `mar_pesca_feliz`. Esto es solo el
nombre interno que usa el código — el orden real de reconocimiento
sigue dependiendo de en qué orden compilaste las imágenes en
`libro.mind` (targetIndex 0, 1, 2, 3 y 4 respectivamente). Si cambiás
el orden de las páginas físicas del libro, avisame para reordenar
`config.js`.

Cualquier página se puede escanear en cualquier orden — no hace falta
pasar por las 4 de intento antes de llegar a `mar_pesca_feliz`.

## Panel de administrador

Entrá a `tu-sitio.github.io/tu-repo/admin.html` (no está enlazado
desde ningún lado del juego, a propósito). Contraseña: `080184`.

Desde ahí podés ver cuántos jugadores arrancaron el juego de pesca, y
editar en caliente (sin volver a subir código):
- Duración de cada intento (páginas mar_pesca1 a 4)
- Duración del juego final
- Puntos por pez atrapado
- Cantidad máxima de peces en pantalla a la vez
- Cada cuánto aparece un pez nuevo

**Importante sobre la contraseña**: es una validación simple hecha en
el navegador, NO es seguridad real — cualquiera que mire el código
fuente de `admin.js` puede verla. Para este proyecto (sin datos
personales) me pareció razonable, pero no lo uses para nada más
sensible.

**Importante sobre el contador y los valores editables**: usan un
servicio externo gratuito y sin registro (`countapi`) para guardarse.
No es un servicio nuestro, no hay garantía de que siga funcionando
para siempre — el juego está armado para que si ese servicio falla o
está caído, todo siga funcionando igual con los valores por defecto
de `config.js` (nunca se rompe el juego por esto). Si en el futuro
quieren algo más robusto con estadísticas reales (tiempo jugado
promedio, etc.), eso sí requiere un backend de verdad — lo charlamos
cuando quieran dar ese paso.

## El resto

Funciona igual que antes: visor circular transparente, Redi grande y
quieto (sin flotar), pez que escapa rápido en las páginas de intento,
juego de pesca real en `mar_pesca_feliz` con +10 por pez, contador de
puntos, contador de jugadores, crédito "Producto de Matías Brizzio"
(link a Instagram) siempre visible abajo, y pantalla de cierre con
invitación a "La Gran Carrera" tanto al terminar el juego como si
responden que no quieren ir a pescar.

## Sonidos (opcionales)

Si querés agregar sonido, subí estos archivos sueltos junto a los
demás:

```
agua.mp3
captura.mp3
correcto.mp3
incorrecto.mp3
escape.mp3
```
