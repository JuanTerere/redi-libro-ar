# Redi — ¿Dónde están los peces? 🐟

Archivos sueltos en un único nivel (sin carpetas), porque el
drag-and-drop de GitHub venía aplanando la estructura de todas formas.

## Cómo subir esto a GitHub

1. Borrá lo que haya en el repositorio actual.
2. Seleccioná TODOS los archivos de esta carpeta (Ctrl+A / Cmd+A) y
   arrastralos al recuadro de "Add file → Upload files" de GitHub.
3. Commit changes.
4. Settings → Pages → Deploy from branch → main → / (root) → Save.

## Solo 2 imágenes/marcadores en total

El libro usa DOS imágenes nada más:

- **`mar_pesca1`** (targetIndex 0): la página de "no se pesca nada".
  Está impresa en varias páginas físicas del libro, pero es la MISMA
  imagen en todas — para MindAR es un solo marcador, así que no
  importa cuál de esas páginas físicas escanee el chico, el resultado
  es siempre igual (a propósito: menos imágenes parecidas entre sí,
  menos confusión al reconocer).
- **`mar_pesca_feliz`** (targetIndex 1): la única página donde sí se
  puede pescar de verdad.

Cualquiera de las dos se puede escanear primero — cada marcador se
reconoce de forma independiente, no hay orden obligatorio.

Si en el futuro compilás `libro.mind` de nuevo, subí las imágenes en
este orden: primero la de "no se pesca", después "mar_pesca_feliz".
Si el orden queda invertido, se arregla cambiando el `targetIndex` de
cada escena en `config.js` (un número, nada más).

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
quieto (sin flotar). En la página de intento, los peces entran nadando
desde un costado, cruzan la pantalla y salen por el otro lado en un
flujo continuo — si tocás uno, acelera y se escapa (nunca se atrapa,
a propósito, para generar esa frustración de "tiramos las redes y no
sacamos nada"). En `mar_pesca_feliz`, juego de pesca real con +10 por
pez, contador de puntos, contador de jugadores, crédito "Producto de
Matías Brizzio" (link a Instagram) siempre visible abajo, y pantalla
de cierre con invitación a "La Gran Carrera" tanto al terminar el
juego como si responden que no quieren ir a pescar.

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
