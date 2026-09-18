// Información ficticia del negocio para el prototipo del asistente.
// Los valores son estimados y deben confirmarse antes de ofrecer un precio final.
export const agentKnowledge = {
  coverage: ['CABA', 'Zona Norte', 'Zona Oeste'],
  schedule: 'Lunes a sábados de 9 a 18 h',
  services: [
    { id: 1, name: 'Sofá o sillón', keywords: ['sofa', 'sofá', 'sillon', 'sillón'], estimates: { 'Pequeño': '$35.000', 'Mediano': '$45.000', 'Grande': '$60.000' } },
    { id: 2, name: 'Sillas', keywords: ['silla', 'sillas'], estimates: { 'Pequeño': '$8.000 por unidad', 'Mediano': '$10.000 por unidad', 'Grande': '$12.000 por unidad' } },
    { id: 3, name: 'Colchón', keywords: ['colchon', 'colchón'], estimates: { 'Pequeño': '$22.000', 'Mediano': '$28.000', 'Grande': '$35.000' } },
    { id: 4, name: 'Alfombra de auto', keywords: ['alfombra de auto', 'alfombra auto', 'alfombras del auto'], estimates: { 'Pequeño': '$18.000', 'Mediano': '$25.000', 'Grande': '$32.000' } },
    { id: 5, name: 'Alfombra de casa', keywords: ['alfombra de casa', 'alfombra hogar', 'alfombra'], estimates: { 'Pequeño': '$15.000', 'Mediano': '$25.000', 'Grande': '$40.000' } },
  ],
  faqs: {
    services: 'Realizamos limpieza de sofás, sillones, sillas, colchones y alfombras de casa o de auto.',
    homeVisit: 'Sí, realizamos el servicio a domicilio.',
    photos: 'Sí, podés enviar fotos por WhatsApp para ayudarnos a preparar una estimación.',
    duration: 'El tiempo depende del servicio, el tamaño, el estado del material y la ubicación. Podemos darte una duración aproximada cuando revisemos esos datos.',
    schedule: 'Atendemos de lunes a sábados, de 9 a 18 h.',
    stains: 'Sí, tratamos manchas. El resultado depende del tipo de mancha, el material y el tiempo que lleva.',
    car: 'Realizamos limpieza de alfombras y tapizados puntuales de autos. Por el momento no ofrecemos lavado integral del vehículo.',
  },
}
