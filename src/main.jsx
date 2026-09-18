import React, { useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { ArrowRight, Camera, Check, Clock3, MapPin, MessageCircle, ShieldCheck, Sparkles, Star } from 'lucide-react'
import './styles.css'
import './overrides.css'
import './chat.css'
import { agentKnowledge } from './agentKnowledge'

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'
const DEMO_MODE = import.meta.env.PROD || import.meta.env.VITE_DEMO_MODE === 'true'

const services = [
  { title: 'Sofás y sillones', text: 'Limpieza profunda para recuperar color, aroma y suavidad.', icon: '🛋️' },
  { title: 'Sillas y colchones', text: 'Higienización cuidadosa para el uso diario y el descanso.', icon: '🪑' },
  { title: 'Alfombras', text: 'Tratamiento de manchas y suciedad sin salir de tu casa.', icon: '✨' },
]

const benefits = [
  ['Atención a domicilio', 'Coordinamos día y horario según tu disponibilidad.', Clock3],
  ['Trabajo confiable', 'Cuidamos cada material y dejamos todo ordenado.', ShieldCheck],
  ['Presupuesto claro', 'Te respondemos con una propuesta sin vueltas.', Check],
]

function App() {
  const [showCleanSofa, setShowCleanSofa] = useState(false)
  const [cardMotion, setCardMotion] = useState({ x: 0, y: 0 })
  const [formValues, setFormValues] = useState({ name: '', service: '', message: '' })
  const [formErrors, setFormErrors] = useState({})
  const [chatOpen, setChatOpen] = useState(false)
  const [chatInput, setChatInput] = useState('')
  const [chatOptions, setChatOptions] = useState(['¿Qué servicios ofrecen?', '¿Cuánto cuesta limpiar un sofá?', '¿Qué zonas cubren?', '¿Cómo solicito un presupuesto?', '¿Puedo enviar fotos?', 'Otra consulta'])
  const [selectedService, setSelectedService] = useState(null)
  const [chatMessages, setChatMessages] = useState([{ from: 'agent', text: '¡Hola! Soy el asistente de Tapizados Express. ¿Qué necesitás limpiar?' }])
  const [chatHistory, setChatHistory] = useState([])
  const [quote, setQuote] = useState(null)
  const [leadStep, setLeadStep] = useState(null)
  const [leadData, setLeadData] = useState({ name: '', locality: '', phone: '' })
  const conversationIdRef = useRef(null)
  const conversationPromiseRef = useRef(null)
  const whatsappUrl = 'https://wa.me/5491162203722?text=Hola%2C%20quiero%20solicitar%20un%20presupuesto%20para%20limpieza%20de%20tapizados.'

  const validateField = (field, value, values = formValues) => {
    const cleanValue = value.trim()
    if (field === 'name') {
      if (!cleanValue) return 'El nombre es obligatorio.'
      if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s]+$/.test(cleanValue)) return 'El nombre solo puede contener letras.'
    }
    if (field === 'service' && !cleanValue) return 'Elegí qué necesitás limpiar.'
    if (field === 'message') {
      if (!cleanValue) return values.service === 'Otro' ? 'Si elegís “Otro”, especificá qué necesitás limpiar.' : 'El mensaje es obligatorio.'
    }
    return ''
  }

  const ensureConversation = async () => {
    if (DEMO_MODE) return null
    if (conversationIdRef.current) return conversationIdRef.current
    if (!conversationPromiseRef.current) {
      conversationPromiseRef.current = fetch(`${API_URL}/conversaciones`, { method: 'POST' })
        .then((response) => {
          if (!response.ok) throw new Error('No se pudo crear la conversación')
          return response.json()
        })
        .then((data) => {
          conversationIdRef.current = data.id
          return data.id
        })
        .finally(() => { conversationPromiseRef.current = null })
    }
    return conversationPromiseRef.current
  }

  const saveChatMessage = async (role, content) => {
    if (DEMO_MODE) return
    try {
      const conversationId = await ensureConversation()
      await fetch(`${API_URL}/conversaciones/${conversationId}/mensajes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rol: role, contenido: content }),
      })
    } catch {
      // La conversación puede seguir funcionando aunque la API no esté disponible.
      // La pantalla informa el error cuando se intenta guardar los datos del cliente.
    }
  }

  const handleFieldChange = (field, value) => {
    const nextValues = { ...formValues, [field]: value }
    setFormValues(nextValues)
    if (formErrors[field]) setFormErrors((current) => ({ ...current, [field]: validateField(field, value, nextValues) }))
    if (field === 'service' && value === 'Otro' && formValues.message.trim() === '') setFormErrors((current) => ({ ...current, message: 'Si elegís “Otro”, especificá qué necesitás limpiar.' }))
    if (field === 'service' && value !== 'Otro' && formErrors.message) setFormErrors((current) => ({ ...current, message: validateField('message', formValues.message, nextValues) }))
  }

  const handleFieldBlur = (field) => setFormErrors((current) => ({ ...current, [field]: validateField(field, formValues[field]) }))

  const handleSubmit = (event) => {
    event.preventDefault()
    const errors = Object.fromEntries(Object.keys(formValues).map((field) => [field, validateField(field, formValues[field])]))
    setFormErrors(errors)
    if (Object.values(errors).some(Boolean)) return
    alert('¡Gracias! Tu solicitud fue recibida. Te contactaremos a la brevedad.')
  }

  const sendChatMessage = async (message) => {
    if (!message) return
    if (leadStep) {
      const fieldLabels = { name: 'tu localidad', locality: 'tu teléfono o WhatsApp' }
      const nextStep = { name: 'locality', locality: 'phone' }
      const lettersOnly = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s]+$/
      const digitsOnly = /^\d{8,10}$/
      if ((leadStep === 'name' || leadStep === 'locality') && !lettersOnly.test(message)) {
        const field = leadStep === 'name' ? 'El nombre' : 'La localidad'
        setChatMessages((current) => [...current, { from: 'agent error', text: `${field} es incorrecto. Usá solamente letras y volvé a ingresar el dato.` }])
        setChatInput('')
        void saveChatMessage('usuario', message)
        void saveChatMessage('agente', `${field} es incorrecto. Usá solamente letras y volvé a ingresar el dato.`)
        return
      }
      if (leadStep === 'phone' && !digitsOnly.test(message)) {
        setChatMessages((current) => [...current, { from: 'agent error', text: 'El teléfono es incorrecto. Debe contener solamente números y tener entre 8 y 10 dígitos. Volvé a ingresarlo.' }])
        setChatInput('')
        void saveChatMessage('usuario', message)
        void saveChatMessage('agente', 'El teléfono es incorrecto. Debe contener solamente números y tener entre 8 y 10 dígitos. Volvé a ingresarlo.')
        return
      }
      const updatedLead = { ...leadData, [leadStep]: message }
      if (leadStep === 'phone') {
        setLeadData(updatedLead)
        void saveChatMessage('usuario', message)
        if (DEMO_MODE) {
          setLeadStep(null)
          const demoReply = `¡Gracias, ${updatedLead.name}! Esta es una demostración: los datos no se guardan ni se envían a ningún servidor. En una versión real, el negocio podría contactarte al ${updatedLead.phone} para confirmar disponibilidad.`
          setChatMessages((current) => [...current, { from: 'user', text: message }, { from: 'agent', text: demoReply }])
          setChatOptions(['Volver al inicio del chat'])
        } else try {
          const response = await fetch(`${API_URL}/consultas`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              nombre: updatedLead.name,
              localidad: updatedLead.locality,
              telefono: updatedLead.phone,
              servicio_id: quote?.serviceId,
              tamano: quote?.size,
              presupuesto_estimado: Number(quote?.price.replace(/[^0-9]/g, '')),
            }),
          })
          if (!response.ok) throw new Error('No se pudo guardar la consulta')
          setLeadStep(null)
          const reply = `¡Gracias, ${updatedLead.name}! Registré tu consulta para ${quote?.service || 'el servicio solicitado'} de tamaño ${quote?.size?.toLowerCase() || 'a confirmar'}, con un presupuesto estimado de ${quote?.price || 'a confirmar'}. Te contactaremos al ${updatedLead.phone} para confirmar disponibilidad.`
          setChatMessages((current) => [...current, { from: 'user', text: message }, { from: 'agent', text: reply }])
          void saveChatMessage('agente', reply)
          setChatOptions(['Volver al inicio del chat'])
        } catch {
          setChatMessages((current) => [...current, { from: 'agent error', text: 'No pude guardar la consulta en este momento. Verificá que la API esté encendida e intentá nuevamente.' }])
        }
      } else {
        setLeadData(updatedLead)
        setLeadStep(nextStep[leadStep])
        const reply = `Perfecto. Ahora indicame ${fieldLabels[leadStep]}.`
        setChatMessages((current) => [...current, { from: 'user', text: message }, { from: 'agent', text: reply }])
        void saveChatMessage('usuario', message)
        void saveChatMessage('agente', reply)
      }
      setChatInput('')
      return
    }
    setChatHistory((current) => [...current, { messages: chatMessages, options: chatOptions, service: selectedService }])
    const normalized = message.toLowerCase()
    void saveChatMessage('usuario', message)
    const matchingService = agentKnowledge.services.find((service) => service.keywords.some((keyword) => normalized.includes(keyword)))
    const currentService = matchingService || selectedService
    const size = ['Pequeño', 'Mediano', 'Grande'].find((option) => normalized.includes(option.toLowerCase()))
    let reply = `Gracias por tu consulta. ${agentKnowledge.faqs.services} ¿Qué servicio necesitás?`
    let nextOptions = agentKnowledge.services.map((service) => service.name).concat('Otra consulta')
    if (matchingService) setSelectedService(matchingService)
    if (size && currentService) {
      const price = currentService.estimates[size]
      setQuote({ serviceId: currentService.id, service: currentService.name, size, price })
      reply = `Para ${currentService.name} de tamaño ${size.toLowerCase()}, el presupuesto estimado es ${price}. Es un valor orientativo y puede variar según el estado del trabajo.`
      nextOptions = ['Quiero dejar mis datos', 'Resolví mi consulta', 'Volver al inicio del chat', 'Volver a la pregunta anterior']
    } else if (normalized.includes('tardan') || normalized.includes('demora') || normalized.includes('tiempo')) {
      reply = currentService
        ? `Para ${currentService.name}, el tiempo depende del tamaño, el estado del material y la ubicación. Cuando recibamos esos datos podremos darte una duración aproximada.`
        : agentKnowledge.faqs.duration
      nextOptions = ['Otra consulta']
    } else if (normalized.includes('precio') || normalized.includes('presupuesto') || normalized.includes('cuánto') || normalized.includes('cuanto')) {
      reply = currentService
        ? `Para ${currentService.name}, primero necesito conocer el tamaño para darte un presupuesto estimado. ¿Es pequeño, mediano o grande?`
        : 'Para calcular un presupuesto estimado necesito saber qué servicio querés solicitar.'
      nextOptions = currentService ? ['Pequeño', 'Mediano', 'Grande', 'Otra consulta'] : agentKnowledge.services.map((service) => service.name).concat('Otra consulta')
    } else if (normalized.includes('zona') || normalized.includes('caba') || normalized.includes('belgrano') || normalized.includes('palermo')) {
      reply = `Atendemos ${agentKnowledge.coverage.join(', ')}. Para confirmar cobertura, decime tu localidad.`
      nextOptions = [...agentKnowledge.coverage, 'Otra consulta']
    } else if (normalized.includes('foto') || normalized.includes('imagen')) {
      reply = agentKnowledge.faqs.photos
      nextOptions = ['Otra consulta']
    } else if (normalized.includes('sábado') || normalized.includes('sabado') || normalized.includes('horario') || normalized.includes('atienden')) {
      reply = agentKnowledge.faqs.schedule
      nextOptions = ['Otra consulta']
    } else if (normalized.includes('mancha') || normalized.includes('vino') || normalized.includes('suciedad')) {
      reply = agentKnowledge.faqs.stains
      nextOptions = ['Otra consulta']
    } else if (normalized.includes('auto') || normalized.includes('vehículo') || normalized.includes('vehiculo')) {
      reply = agentKnowledge.faqs.car
      nextOptions = ['Otra consulta']
    } else if (normalized.includes('domicilio') || normalized.includes('casa')) {
      reply = agentKnowledge.faqs.homeVisit
      nextOptions = [...agentKnowledge.services.map((service) => service.name), 'Otra consulta']
    } else if (matchingService) {
      reply = `Realizamos ${matchingService.name.toLowerCase()} a domicilio. ¿Qué tamaño tiene el trabajo?`
      nextOptions = ['Pequeño', 'Mediano', 'Grande', 'Otra consulta']
    }
    setChatMessages((current) => [...current, { from: 'user', text: message }, { from: 'agent', text: reply }])
    void saveChatMessage('agente', reply)
    if (!nextOptions.includes('Volver a la pregunta anterior')) nextOptions.push('Volver a la pregunta anterior')
    setChatOptions(nextOptions)
    setChatInput('')
  }

  const handleChatSubmit = (event) => {
    event.preventDefault()
    sendChatMessage(chatInput.trim())
  }

  const handleOtherQuestion = () => {
    setChatHistory((current) => [...current, { messages: chatMessages, options: chatOptions, service: selectedService }])
    setChatMessages((current) => [...current, { from: 'agent', text: '¿Qué querés saber? Escribí tu consulta y voy a intentar orientarte.' }])
    setChatOptions([])
    void saveChatMessage('agente', '¿Qué querés saber? Escribí tu consulta y voy a intentar orientarte.')
  }

  const finishChat = () => {
    const reply = '¡Muchas gracias por consultarnos! Estamos a disposición para ayudarte cuando lo necesites.'
    setChatMessages((current) => [...current, { from: 'user', text: 'Resolví mi consulta' }, { from: 'agent', text: reply }])
    void saveChatMessage('usuario', 'Resolví mi consulta')
    void saveChatMessage('agente', reply)
    setChatOptions(['Volver al inicio del chat'])
  }

  const startLeadCapture = () => {
    setLeadStep('name')
    setLeadData({ name: '', locality: '', phone: '' })
    const reply = 'Perfecto. Para que podamos contactarte, ¿me indicás tu nombre?'
    setChatMessages((current) => [...current, { from: 'agent', text: reply }])
    void saveChatMessage('agente', reply)
    setChatOptions([])
  }

  const restartChat = () => {
    setChatMessages([{ from: 'agent', text: '¡Hola! Soy el asistente de Tapizados Express. ¿Qué necesitás limpiar?' }])
    setChatOptions(['¿Qué servicios ofrecen?', '¿Cuánto cuesta limpiar un sofá?', '¿Qué zonas cubren?', '¿Cómo solicito un presupuesto?', '¿Puedo enviar fotos?', 'Otra consulta'])
    setSelectedService(null)
    setChatHistory([])
    setQuote(null)
    setLeadStep(null)
    setLeadData({ name: '', locality: '', phone: '' })
    setChatInput('')
    conversationIdRef.current = null
    conversationPromiseRef.current = null
  }

  const goBack = () => {
    const previous = chatHistory[chatHistory.length - 1]
    if (!previous) return
    setChatMessages(previous.messages)
    setChatOptions(previous.options)
    setSelectedService(previous.service)
    setChatHistory((current) => current.slice(0, -1))
    setChatInput('')
  }

  return <>
    <header className="site-header">
      <a className="brand" href="#inicio"><span className="brand-mark"><Sparkles size={17} /></span> Tapizados<span>Express</span></a>
      <nav><a href="#servicios">Servicios</a><a href="#trabajos">Trabajos</a><a href="#zonas">Cobertura</a><a className="nav-cta" href="#presupuesto">Pedir presupuesto <ArrowRight size={15} /></a></nav>
    </header>

    <main>
      <section className="hero" id="inicio">
        <div className="hero-copy">
          <p className="eyebrow"><span></span> Limpieza profesional a domicilio</p>
          <h1>Renová tus espacios,<br /><em>disfrutá tu hogar.</em></h1>
          <p className="hero-text">Devolvemos vida a tus sofás, sillas, colchones y alfombras con un servicio cuidadoso, práctico y pensado para vos.</p>
          <div className="hero-actions"><a className="button primary" href="#presupuesto">Quiero mi presupuesto <ArrowRight size={18} /></a><a className="button secondary" href={whatsappUrl} target="_blank" rel="noreferrer"><MessageCircle size={18} /> Hablar por WhatsApp</a></div>
          <div className="trust"><div className="avatars"><span>MG</span><span>LP</span><span>+</span></div><div><div className="stars"><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /></div><small>Servicio cercano y confiable</small></div></div>
        </div>
        <div className="hero-visual"><div className="visual-card" style={{ transform: `perspective(900px) rotateX(${cardMotion.y}deg) rotateY(${cardMotion.x}deg) rotate(2deg)` }} onPointerMove={(event) => { const box = event.currentTarget.getBoundingClientRect(); setCardMotion({ x: ((event.clientX - box.left) / box.width - .5) * 7, y: -((event.clientY - box.top) / box.height - .5) * 7 }) }} onPointerLeave={() => setCardMotion({ x: 0, y: 0 })}><div className="visual-label"><span className="dot"></span> Resultado real</div><div className="before-after"><img src={showCleanSofa ? '/images/sofa-despues.png' : '/images/sofa-antes.png'} alt={showCleanSofa ? 'Sillón después de la limpieza' : 'Sillón antes de la limpieza'} /><div className="image-state">{showCleanSofa ? 'DESPUÉS' : 'ANTES'}</div><button className="flip-button" type="button" onClick={() => setShowCleanSofa((current) => !current)}>{showCleanSofa ? 'Ver antes' : 'Ver después'} <ArrowRight size={14} /></button></div><div className="visual-caption"><strong>Una limpieza que se nota.</strong><span>Mové el cursor para explorar</span></div></div></div>
      </section>

      <section className="section intro" id="servicios"><div className="section-heading"><p className="eyebrow">Lo que hacemos</p><h2>Tu casa también merece<br /><em>sentirse renovada.</em></h2></div><p className="section-lead">Trabajamos con dedicación para que vuelvas a disfrutar esos muebles que forman parte de tu día a día.</p><div className="service-grid">{services.map(s => <article className="service-card" key={s.title}><span className="service-icon">{s.icon}</span><h3>{s.title}</h3><p>{s.text}</p><a href="#presupuesto">Consultar <ArrowRight size={15} /></a></article>)}</div></section>

      <section className="section benefits"><div className="benefit-grid">{benefits.map(([title, text, Icon]) => <div className="benefit" key={title}><span className="benefit-icon"><Icon size={19} /></span><div><h3>{title}</h3><p>{text}</p></div></div>)}</div></section>

      <section className="section work" id="trabajos"><div className="section-heading"><p className="eyebrow">Nuestros trabajos</p><h2>La diferencia está<br /><em>en los detalles.</em></h2></div><div className="gallery"><div className="gallery-card large"><div className="gallery-image image-one"><img src="/images/sofa-despues.png" alt="Sillón limpio después del servicio" /><span>SOFÁ</span></div><div className="gallery-footer"><span>Renovación de sofá</span><small>Villa Urquiza</small></div></div><div className="gallery-card"><div className="gallery-image image-two"><img src="/images/alfombra.png" alt="Alfombra limpia después del servicio" /><span>ALFOMBRA</span></div><div className="gallery-footer"><span>Limpieza de alfombra</span><small>Belgrano</small></div></div><div className="gallery-card"><div className="gallery-image image-three"><img src="/images/sillas.png" alt="Sillas limpias después del servicio" /><span>SILLAS</span></div><div className="gallery-footer"><span>Higiene de sillas</span><small>Palermo</small></div></div></div></section>

      <section className="section coverage" id="zonas"><div className="coverage-banner"><div className="coverage-map-grid"></div><div className="coverage-map-route route-one"></div><div className="coverage-map-route route-two"></div><div className="coverage-map-route route-three"></div><div className="coverage-copy"><p className="eyebrow"><span></span> Nuestra sucursal</p><h2>Estamos cerca<br /><em>de tu casa.</em></h2><p>Atendemos hogares y comercios en CABA y alrededores.</p><div className="zone-list"><span><MapPin size={15} /> CABA</span><span><MapPin size={15} /> Zona Norte</span><span><MapPin size={15} /> Zona Oeste</span></div><a className="button primary map-button" href="https://www.google.com/maps/search/?api=1&query=Avenida+Belgrano+3000%2C+CABA%2C+Argentina" target="_blank" rel="noreferrer"><MapPin size={16} /> Cómo llegar</a></div><div className="map-pin coverage-pin"><MapPin size={23} /></div><span className="coverage-address">Av. Belgrano 3000 · CABA</span></div></section>

      <section className="quote section" id="presupuesto"><div className="quote-copy"><p className="eyebrow">Empecemos</p><h2>¿Querés devolverle<br />la vida a tus <em>tapizados?</em></h2><p>Contanos qué necesitás y te respondemos con un presupuesto personalizado.</p><div className="contact-links"><a href={whatsappUrl} target="_blank" rel="noreferrer"><MessageCircle size={17} /> 11 6220-3722</a><a href="mailto:hola@tapizados-express.com"><span className="mail-icon">@</span> hola@tapizados-express.com</a></div></div><form className="quote-form" onSubmit={handleSubmit} noValidate><label>Nombre<input value={formValues.name} onChange={(event) => handleFieldChange('name', event.target.value)} onBlur={() => handleFieldBlur('name')} aria-invalid={Boolean(formErrors.name)} placeholder="¿Cómo te llamás?" />{formErrors.name && <small className="field-error">{formErrors.name}</small>}</label><label>¿Qué necesitás limpiar?<select value={formValues.service} onChange={(event) => handleFieldChange('service', event.target.value)} onBlur={() => handleFieldBlur('service')} aria-invalid={Boolean(formErrors.service)}><option value="" disabled>Elegí una opción</option><option>Sofá o sillón</option><option>Sillas</option><option>Colchón</option><option>Alfombra</option><option>Otro</option></select>{formErrors.service && <small className="field-error">{formErrors.service}</small>}</label><label>Mensaje<textarea value={formValues.message} onChange={(event) => handleFieldChange('message', event.target.value)} onBlur={() => handleFieldBlur('message')} aria-invalid={Boolean(formErrors.message)} placeholder="Contanos un poco más..."></textarea>{formErrors.message && <small className="field-error">{formErrors.message}</small>}</label><button className="button primary" type="submit">Solicitar presupuesto <ArrowRight size={17} /></button></form></section>
    </main>
    <footer><a className="brand" href="#inicio"><span className="brand-mark"><Sparkles size={15} /></span> Tapizados<span>Express</span></a><p>Calidad y cuidado en cada limpieza.</p><div><a href="#inicio">Volver arriba ↑</a><a href="#" aria-label="Redes sociales"><Camera size={17} /></a></div></footer>
    <div className={`chat-widget ${chatOpen ? 'is-open' : ''}`}>
      {chatOpen && <section className="chat-panel" aria-label="Asistente de Tapizados Express">
        <div className="chat-header"><div><strong>Asistente Tapizados Express</strong><small>Respuesta inicial automática</small></div><button type="button" onClick={() => setChatOpen(false)} aria-label="Cerrar chat">×</button></div>
        <div className="chat-messages">{chatMessages.map((message, index) => <p className={`chat-message ${message.from}`} key={`${message.from}-${index}`}>{message.text}</p>)}</div>
        {chatOptions.length > 0 && <div className="chat-quick"><small>Podés elegir una opción o escribir abajo:</small>{chatOptions.map((option) => option === 'Otra consulta' ? <button className="chat-other" type="button" key={option} onClick={handleOtherQuestion}>{option}</button> : option === 'Quiero dejar mis datos' ? <button type="button" key={option} onClick={startLeadCapture}>{option}</button> : option === 'Resolví mi consulta' ? <button type="button" key={option} onClick={finishChat}>{option}</button> : option === 'Volver al inicio del chat' ? <button className="chat-other" type="button" key={option} onClick={restartChat}>{option}</button> : option === 'Volver a la pregunta anterior' ? <button className="chat-other" type="button" key={option} onClick={goBack}>{option}</button> : <button type="button" key={option} onClick={() => sendChatMessage(option)}>{option}</button>)}</div>}
        <form className="chat-form" onSubmit={handleChatSubmit}><input value={chatInput} onChange={(event) => setChatInput(event.target.value)} placeholder="Escribí tu consulta..." aria-label="Consulta" /><button type="submit" aria-label="Enviar consulta"><ArrowRight size={17} /></button></form>
      </section>}
      <button className="chat-launcher" type="button" onClick={() => { setChatOpen((current) => !current); if (!chatOpen && !DEMO_MODE) void ensureConversation() }} aria-label="Abrir asistente"><MessageCircle size={22} />{!chatOpen && <span>¿Necesitás ayuda?</span>}</button>
    </div>
  </>
}

createRoot(document.getElementById('root')).render(<App />)
