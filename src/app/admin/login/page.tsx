"use client";

import { useActionState } from "react";
import Link from "next/link";
import { FloatingDecor } from "@/components/FloatingDecor";
import { loginAction } from "@/lib/actions";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, null);

  return (
    <div className="store">
      <div className="store-mesh" aria-hidden />
      <FloatingDecor />

      <div className="store-inner mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 py-10">
        <div className="anim-rise text-center">
          <div className="anim-float mx-auto flex h-20 w-20 items-center justify-center rounded-[1.5rem] bg-gradient-to-br from-[#fff0f4] via-[#ffd4bc] to-[#fce4ec] text-4xl shadow-lg">
            🧁
          </div>
          <h1 className="font-display mt-6 text-3xl font-semibold text-[#2d1b14]">
            Painel da Maria
          </h1>
          <p className="mt-2 text-sm text-[#6b5349]">Gerencie a bolsinha do dia</p>
        </div>

        <form
          action={formAction}
          className="panel-glass anim-rise-d1 mt-10 space-y-4 p-6"
        >
          <div>
            <p className="section-eyebrow">Acesso</p>
            <h2 className="section-heading mt-1 text-xl font-semibold">Entrar</h2>
          </div>

          <label className="block text-sm font-bold text-[#2d1b14]">
            Senha
            <input
              type="password"
              name="password"
              required
              className="input-soft mt-2 w-full px-4 py-3"
              autoComplete="current-password"
              placeholder="••••••••"
            />
          </label>

          {state?.error && (
            <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="btn-brand w-full py-4 text-sm disabled:opacity-50"
          >
            {pending ? "Entrando..." : "Entrar no painel"}
          </button>
        </form>

        <Link
          href="/"
          className="btn-ghost anim-rise-d2 mt-5 flex items-center justify-center py-3.5 text-sm font-bold text-[#6b5349]"
        >
          ← Voltar ao site
        </Link>
      </div>
    </div>
  );
}
