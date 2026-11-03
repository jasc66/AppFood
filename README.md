# AppFood (CompraYa)

Landing page estática de compras en línea (HTML, CSS y JS sin dependencias).

## Diseño
- Tokens en `:root` (`css/styles.css`), tipografía Bricolage Grotesque + Poppins.
- Carga orquestada del hero, barra de navegación fija con efecto glass y enlace activo.
- Revelado escalonado al hacer scroll (IntersectionObserver).

## Gestos de movimiento
- **Blur**: en los listados, la tarjeta bajo el cursor/foco resalta y el resto se desenfoca.
- **Magnification**: dock de redes sociales que crece con la cercanía del puntero.
- **Crossfade**: testimonios rotativos (4,5 s) con botón de pausa, pausa en hover/foco y navegación por teclado.

## Accesibilidad
- `lang="es"`, enlace "Saltar al contenido", foco visible, acordeón operable con teclado.
- `prefers-reduced-motion` desactiva animaciones, rotación y magnificación.
