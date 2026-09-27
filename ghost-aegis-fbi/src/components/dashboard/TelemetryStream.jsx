import { useEffect, useRef, useState } from 'react'
import './TelemetryStream.css'

const MAX_EVENTS = 60

function createEventTimestamp() {
  const epochMicroseconds = Math.floor((performance.timeOrigin + performance.now()) * 1000)
  const date = new Date(Math.floor(epochMicroseconds / 1000)).toISOString()
  const subMillisecond = String(epochMicroseconds % 1000).padStart(3, '0')

  return {
    epochMicroseconds,
    timestamp: `${date.slice(0, -1)}${subMillisecond}Z`,
  }
}

function createTelemetryEvent(sequence) {
  const isRedTeam = sequence % 2 === 0
  const time = createEventTimestamp()

  return {
    id: `${time.epochMicroseconds}-${sequence}`,
    ...time,
    source: isRedTeam ? 'RED-SIM' : 'BLUE-SOC',
    message: isRedTeam
      ? 'Attack payload · TCP SYN burst directed at WAF gateway'
      : 'eBPF mitigation · XDP policy applied, source traffic contained',
  }
}

function buildPcap(events) {
  const encoder = new TextEncoder()
  const packets = [...events].reverse().map((event, packetIndex) => {
    const payload = encoder.encode(`[${event.source}] ${event.message}`)
    const packet = new Uint8Array(42 + payload.length)
    const view = new DataView(packet.buffer)

    packet.set([0x02, 0x00, 0x00, 0x00, 0x00, 0x02], 0)
    packet.set([0x02, 0x00, 0x00, 0x00, 0x00, event.source === 'RED-SIM' ? 0x41 : 0x42], 6)
    view.setUint16(12, 0x0800, false)

    packet[14] = 0x45
    view.setUint16(16, 28 + payload.length, false)
    view.setUint16(18, packetIndex, false)
    packet[22] = 64
    packet[23] = 17
    packet.set(event.source === 'RED-SIM' ? [198, 51, 100, 41] : [10, 0, 4, 12], 26)
    packet.set(event.source === 'RED-SIM' ? [10, 0, 4, 12] : [198, 51, 100, 41], 30)
    view.setUint16(34, event.source === 'RED-SIM' ? 49152 : 443, false)
    view.setUint16(36, 443, false)
    view.setUint16(38, 8 + payload.length, false)
    packet.set(payload, 42)

    return { event, packet }
  })
  const totalBytes = 24 + packets.reduce((total, item) => total + 16 + item.packet.length, 0)
  const capture = new Uint8Array(totalBytes)
  const captureView = new DataView(capture.buffer)

  captureView.setUint32(0, 0xa1b2c3d4, true)
  captureView.setUint16(4, 2, true)
  captureView.setUint16(6, 4, true)
  captureView.setUint32(16, 65535, true)
  captureView.setUint32(20, 1, true)

  let offset = 24
  packets.forEach(({ event, packet }) => {
    captureView.setUint32(offset, Math.floor(event.epochMicroseconds / 1000000), true)
    captureView.setUint32(offset + 4, event.epochMicroseconds % 1000000, true)
    captureView.setUint32(offset + 8, packet.length, true)
    captureView.setUint32(offset + 12, packet.length, true)
    capture.set(packet, offset + 16)
    offset += 16 + packet.length
  })

  return capture
}

function exportPcap(events) {
  const capture = buildPcap(events)
  const url = URL.createObjectURL(new Blob([capture], { type: 'application/vnd.tcpdump.pcap' }))
  const link = document.createElement('a')

  link.href = url
  link.download = `aegis-telemetry-${new Date().toISOString().replaceAll(':', '-')}.pcap`
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function TelemetryStream() {
  const [events, setEvents] = useState([])
  const [isPaused, setIsPaused] = useState(false)
  const [exportStatus, setExportStatus] = useState('')
  const nextSequence = useRef(0)

  useEffect(() => {
    if (isPaused) return undefined

    const interval = window.setInterval(() => {
      const event = createTelemetryEvent(nextSequence.current)
      nextSequence.current += 1
      setEvents((current) => [event, ...current].slice(0, MAX_EVENTS))
    }, 800)

    return () => window.clearInterval(interval)
  }, [isPaused])

  function handleExport() {
    exportPcap(events)
    setExportStatus(`PCAP EXPORTED / ${events.length} EVENTS`)
  }

  return (
    <article className="panel feed-panel telemetry-panel" id="case-files">
      <div className="panel-heading telemetry-heading">
        <div>
          <p className="panel-kicker">LIVE / CLASSIFIED</p>
          <h2>Telemetry Stream</h2>
        </div>
        <span className={`telemetry-live${isPaused ? ' telemetry-live--paused' : ''}`}>
          <i /> {isPaused ? 'PAUSED' : 'LIVE'}
        </span>
      </div>
      <div className="telemetry-controls">
        <button
          className="telemetry-button"
          type="button"
          aria-pressed={isPaused}
          onClick={() => setIsPaused((paused) => !paused)}
        >
          {isPaused ? '[ RESUME STREAM ]' : '[ PAUSE STREAM ]'}
        </button>
        <button className="telemetry-button telemetry-button--export" type="button" onClick={handleExport}>
          [ EXPORT PCAP ]
        </button>
      </div>
      <div className="telemetry-log" role="log" aria-label="Live telemetry events" aria-live="off" aria-relevant="additions">
        {events.length === 0 ? (
          <div className="telemetry-empty"><span className="telemetry-cursor" /> WAITING FOR TELEMETRY PACKETS</div>
        ) : events.map((event) => (
          <div className={`telemetry-event telemetry-event--${event.source.toLowerCase()}`} key={event.id}>
            <time dateTime={event.timestamp}>{event.timestamp}</time>
            <span className="telemetry-source">[{event.source}]</span>
            <span className="telemetry-message">{event.message}</span>
          </div>
        ))}
      </div>
      <div className="telemetry-footer" aria-live="polite">
        <span>{isPaused ? 'STREAM SUSPENDED' : 'CAPTURE ACTIVE'} / {events.length} EVENTS BUFFERED</span>
        {exportStatus && <span>{exportStatus}</span>}
      </div>
    </article>
  )
}

export default TelemetryStream