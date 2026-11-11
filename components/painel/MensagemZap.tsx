'use client';

import React, { useState } from 'react';
import { Check, Copy, MessageCircle } from 'lucide-react';
import { modelosReserva } from '@/lib/mensagens';
import type { AdminData, Reserva } from '@/lib/agenda';
import { botao, botaoPri, campo, rotulo } from './ui';

const numero = (tel: string) => {
  const d = tel.replace(/\D/g, '');
  return d.length >= 10 ? (d.length > 11 && d.startsWith('55') ? d : '55' + d) : null;
};

// Mensagem pronta (e editável) para mandar ao cliente pelo WhatsApp, de acordo com a situação da reserva.
export function MensagemZap({ r, st, dados }: { r: Reserva; st: string; dados: AdminData }) {
  const { sugerido, modelos } = modelosReserva(r, dados.mensagens, dados.cfg.sinalPct, dados.cfg.capacidade, st);
  const [id, setId] = useState(sugerido);
  const [texto, setTexto] = useState(() => modelos.find((m) => m.id === sugerido)?.texto ?? '');
  const [copiado, setCopiado] = useState(false);
  const tel = numero(r.whatsapp);

  const trocar = (novo: string) => {
    const m = modelos.find((x) => x.id === novo);
    if (m) {
      setId(m.id);
      setTexto(m.texto);
    }
  };
  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      /* sem permissão para copiar: a pessoa seleciona o texto à mão */
    }
  };

  return (
    <div className="mt-6 rounded-lg border border-[#D2CAB8] bg-[#F6F3EC] p-4">
      <h3 className="font-serif text-lg text-[#14301F]">Mensagem para o cliente</h3>
      <p className="mt-1 text-sm text-stone-600">Escolha a mensagem, mude o que quiser e abra no WhatsApp.</p>
      <label className={`${rotulo} mt-3`}>
        Tipo de mensagem
        <select className={`${campo} mt-1`} value={id} onChange={(e) => trocar(e.target.value)}>
          {modelos.map((m) => (
            <option key={m.id} value={m.id}>
              {m.rotulo}
            </option>
          ))}
        </select>
      </label>
      <textarea aria-label="Texto da mensagem" className={`${campo} mt-3 min-h-[220px] resize-y text-sm leading-relaxed`} value={texto} onChange={(e) => setTexto(e.target.value)} />
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {tel ? (
          <a className={botaoPri} href={`https://wa.me/${tel}?text=${encodeURIComponent(texto)}`} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="h-4 w-4" /> Abrir no WhatsApp
          </a>
        ) : (
          <span className="rounded-md bg-[#F6DAD5] p-2.5 text-sm text-[#8F2517]">WhatsApp do cliente inválido.</span>
        )}
        <button type="button" className={botao} onClick={copiar}>
          {copiado ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {copiado ? 'Copiado' : 'Copiar texto'}
        </button>
      </div>
    </div>
  );
}
