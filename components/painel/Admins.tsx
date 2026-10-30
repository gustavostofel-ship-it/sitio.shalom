'use client';

import React, { useState } from 'react';
import type { AdminData } from '@/lib/agenda';
import type { Chamar } from './tipos';
import { Secao, botao, botaoPerigo, botaoPri, campo, iniciais, rotulo } from './ui';

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

  return (
    <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
      <Secao titulo="Quem tem acesso" texto="Cada pessoa entra com o próprio e-mail e senha.">
        <ul className="divide-y divide-[#EEE9DF]">
          {dados.admins.map((a) => (
            <li key={a.email} className="py-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1B4332] text-sm font-semibold text-amber-100">{iniciais(a.email)}</span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-[#1F2937]">
                    <span className="break-all">{a.email}</span>
                    {a.email === dados.eu && <span className="ml-2 whitespace-nowrap rounded-full bg-[#DDEBDD] px-2 py-0.5 text-xs font-medium text-[#1B4332]">você</span>}
                  </p>
                  <p className="text-sm text-stone-500">Desde {new Date(a.criado_em).toLocaleDateString('pt-BR')}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setTrocando(trocando === a.email ? null : a.email); setNova(''); }} className={botao}>Trocar senha</button>
                  {a.email !== dados.eu && dados.admins.length > 1 && (
                    <button onClick={() => confirm(`Remover o acesso de ${a.email}?`) && chamar('admin.remover', { email: a.email })} className={botaoPerigo}>Remover</button>
                  )}
                </div>
              </div>
              {trocando === a.email && (
                <div className="mt-3 flex gap-2 sm:pl-[52px]">
                  <input type="password" autoComplete="new-password" className={campo} placeholder="Nova senha (mínimo 10 caracteres)" value={nova} onChange={(e) => setNova(e.target.value)} />
                  <button onClick={() => trocar(a.email)} className={`${botaoPri} whitespace-nowrap`}>Salvar</button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </Secao>

      <form onSubmit={criar}>
        <Secao titulo="Adicionar administrador" texto="A pessoa terá controle total do painel.">
          <label className={rotulo}>
            E-mail
            <input type="email" required autoComplete="off" className={`${campo} mt-1`} value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label className={`${rotulo} mt-4`}>
            Senha (mínimo 10 caracteres)
            <input type="password" required minLength={10} autoComplete="new-password" className={`${campo} mt-1`} value={senha} onChange={(e) => setSenha(e.target.value)} />
          </label>
          <button className={`${botaoPri} mt-5`}>Adicionar administrador</button>
        </Secao>
      </form>
    </div>
  );
}
