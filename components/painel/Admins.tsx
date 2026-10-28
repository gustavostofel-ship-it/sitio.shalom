'use client';

import React, { useState } from 'react';
import type { AdminData } from '@/lib/agenda';
import type { Chamar } from './tipos';

const campo = 'w-full rounded-lg border border-stone-300 px-3 py-2 text-sm';

export function Admins({ dados, chamar }: { dados: AdminData; chamar: Chamar }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [trocando, setTrocando] = useState<string | null>(null);
  const [nova, setNova] = useState('');

  const criar = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = await chamar('admin.criar', { email, senha });
    if (r.ok) {
      setEmail('');
      setSenha('');
    }
  };
  const trocar = async (alvo: string) => {
    const r = await chamar('admin.senha', { email: alvo, senha: nova });
    if (r.ok) {
      setTrocando(null);
      setNova('');
    }
  };
  const card = 'bg-white rounded-2xl border border-stone-200 p-4';

  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <div className={card}>
        <h3 className="font-bold">Quem tem acesso ao painel</h3>
        <p className="text-xs text-stone-500 mb-3">Cada pessoa entra com o próprio e-mail e senha.</p>
        <div className="divide-y divide-stone-100">
          {dados.admins.map((a) => (
            <div key={a.email} className="py-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <b className="break-all">{a.email}</b> {a.email === dados.eu && <span className="text-xs text-emerald-700">(você)</span>}
                  <div className="text-xs text-stone-500">criado em {new Date(a.criado_em).toLocaleDateString('pt-BR')}</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setTrocando(trocando === a.email ? null : a.email); setNova(''); }} className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm">Trocar senha</button>
                  {a.email !== dados.eu && dados.admins.length > 1 && (
                    <button onClick={() => confirm(`Remover o acesso de ${a.email}?`) && chamar('admin.remover', { email: a.email })} className="rounded-lg border border-stone-300 text-red-700 px-3 py-1.5 text-sm">Remover</button>
                  )}
                </div>
              </div>
              {trocando === a.email && (
                <div className="flex gap-2 mt-2">
                  <input type="password" autoComplete="new-password" className={campo} placeholder="Nova senha (mínimo 10 caracteres)" value={nova} onChange={(e) => setNova(e.target.value)} />
                  <button onClick={() => trocar(a.email)} className="rounded-lg bg-[#1B4332] text-white px-4 text-sm whitespace-nowrap">Salvar</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={criar} className={card}>
        <h3 className="font-bold">Adicionar administrador</h3>
        <p className="text-xs text-stone-500 mb-3">A pessoa terá controle total do painel.</p>
        <label className="text-xs text-stone-500 block">E-mail<input type="email" required autoComplete="off" className={campo} value={email} onChange={(e) => setEmail(e.target.value)} /></label>
        <label className="text-xs text-stone-500 block mt-3">Senha (mínimo 10 caracteres)<input type="password" required minLength={10} autoComplete="new-password" className={campo} value={senha} onChange={(e) => setSenha(e.target.value)} /></label>
        <button className="mt-4 rounded-xl bg-[#1B4332] text-white px-5 py-2.5 font-bold">Adicionar</button>
      </form>
    </div>
  );
}
