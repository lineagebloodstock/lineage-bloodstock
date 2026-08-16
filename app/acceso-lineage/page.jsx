"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useLineageLanguage } from "../components/use-lineage-language";
import { supabase } from "../lib/supabaseClient";

const TEXT = {
  es: {
    accessTitle: "Lineage Access",
    accessSubtitle: "Ingresá para continuar en Lineage Bloodstock",
    loginTab: "Iniciar sesión",
    createTab: "Crear cuenta",
    name: "Nombre",
    email: "Email",
    password: "Contraseña",
    confirmPassword: "Confirmar contraseña",
    loginButton: "Ingresar",
    createButton: "Crear cuenta",
    noAccount: "¿No tenés cuenta?",
    haveAccount: "¿Ya tenés cuenta?",
    createLink: "Crear cuenta",
    loginLink: "Iniciar sesión",
    passwordMismatch: "Las contraseñas no coinciden.",
    loginSuccess: "Ingresaste correctamente.",
    createSuccess:
      "Cuenta creada correctamente. Revisá tu email para confirmar la cuenta.",
    createSuccessNoConfirm: "Cuenta creada correctamente. Ya podés ingresar.",
    loading: "Procesando...",
    errorGeneric: "Ocurrió un error. Intentá nuevamente.",
    requiredFields: "Completá todos los campos.",
    passwordLength: "La contraseña debe tener al menos 6 caracteres.",
    close: "Cerrar",
  },
  pt: {
    accessTitle: "Lineage Access",
    accessSubtitle: "Entre para continuar no Lineage Bloodstock",
    loginTab: "Entrar",
    createTab: "Criar conta",
    name: "Nome",
    email: "Email",
    password: "Senha",
    confirmPassword: "Confirmar senha",
    loginButton: "Entrar",
    createButton: "Criar conta",
    noAccount: "Não tem conta?",
    haveAccount: "Já tem conta?",
    createLink: "Criar conta",
    loginLink: "Entrar",
    passwordMismatch: "As senhas não coincidem.",
    loginSuccess: "Você entrou corretamente.",
    createSuccess:
      "Conta criada corretamente. Verifique seu email para confirmar sua conta.",
    createSuccessNoConfirm: "Conta criada corretamente. Você já pode entrar.",
    loading: "Processando...",
    errorGeneric: "Ocorreu um erro. Tente novamente.",
    requiredFields: "Preencha todos os campos.",
    passwordLength: "A senha deve ter pelo menos 6 caracteres.",
    close: "Fechar",
  },
  en: {
    accessTitle: "Lineage Access",
    accessSubtitle: "Sign in to continue to Lineage Bloodstock",
    loginTab: "Login",
    createTab: "Create account",
    name: "Name",
    email: "Email",
    password: "Password",
    confirmPassword: "Confirm password",
    loginButton: "Login",
    createButton: "Create account",
    noAccount: "Don’t have an account?",
    haveAccount: "Already have an account?",
    createLink: "Create account",
    loginLink: "Login",
    passwordMismatch: "Passwords do not match.",
    loginSuccess: "You are now logged in.",
    createSuccess:
      "Account created successfully. Check your email to confirm your account.",
    createSuccessNoConfirm: "Account created successfully. You can now log in.",
    loading: "Processing...",
    errorGeneric: "Something went wrong. Please try again.",
    requiredFields: "Please complete all fields.",
    passwordLength: "Password must be at least 6 characters.",
    close: "Close",
  },
};

const LANGUAGES = ["es", "pt", "en"];

function getSupabaseErrorMessage(error, fallback) {
  if (!error?.message) return fallback;

  const message = error.message.toLowerCase();

  if (message.includes("invalid login credentials")) {
    return "Email o contraseña incorrectos.";
  }

  if (message.includes("user already registered")) {
    return "Ya existe una cuenta con este email.";
  }

  if (message.includes("password should be at least")) {
    return "La contraseña debe tener al menos 6 caracteres.";
  }

  if (message.includes("email rate limit exceeded")) {
    return "Se enviaron demasiados emails. Probá nuevamente más tarde.";
  }

  return error.message;
}

function getSafeReturnPath(value) {
  if (!value) return "/noticias";

  try {
    const decoded = decodeURIComponent(value);

    if (!decoded.startsWith("/")) return "/noticias";
    if (decoded.startsWith("/acceso-lineage")) return "/noticias";
    if (decoded.startsWith("/acceso")) return "/noticias";

    return decoded;
  } catch {
    return "/noticias";
  }
}

export default function AccesoLineagePage() {
  const router = useRouter();
  const { language, setLanguage } = useLineageLanguage();
  const t = TEXT[language] || TEXT.es;

  const [returnPath, setReturnPath] = useState("/noticias");

  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const from = params.get("from");

    setReturnPath(getSafeReturnPath(from));
  }, []);

  const backgroundPath = useMemo(() => {
    if (!returnPath || returnPath.startsWith("/acceso")) return "/noticias";
    return returnPath;
  }, [returnPath]);

  function resetMessage() {
    setMessage("");
  }

  function changeMode(nextMode) {
    setMode(nextMode);
    setMessage("");
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setShowConfirmPassword(false);
  }

  function handleClose() {
    router.push(returnPath || "/noticias");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setIsLoading(true);

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    try {
      if (!cleanEmail) {
        setMessage(t.requiredFields);
        setIsLoading(false);
        return;
      }

      if (!password) {
        setMessage(t.requiredFields);
        setIsLoading(false);
        return;
      }

      if (password.length < 6) {
        setMessage(t.passwordLength);
        setIsLoading(false);
        return;
      }

      if (mode === "create") {
        if (!cleanName || !confirmPassword) {
          setMessage(t.requiredFields);
          setIsLoading(false);
          return;
        }

        if (password !== confirmPassword) {
          setMessage(t.passwordMismatch);
          setIsLoading(false);
          return;
        }

        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              name: cleanName,
              language,
              platform: "lineage-bloodstock",
            },
            emailRedirectTo:
              typeof window !== "undefined"
                ? `${window.location.origin}/acceso-lineage`
                : undefined,
          },
        });

        if (error) {
          setMessage(getSupabaseErrorMessage(error, t.errorGeneric));
          setIsLoading(false);
          return;
        }

        setPassword("");
        setConfirmPassword("");

        if (data?.session) {
          setMessage(t.createSuccessNoConfirm);
          router.push(returnPath || "/noticias");
          return;
        }

        setMessage(t.createSuccess);
        setMode("login");
        setIsLoading(false);
        return;
      }

      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (error) {
          setMessage(getSupabaseErrorMessage(error, t.errorGeneric));
          setIsLoading(false);
          return;
        }

        setMessage(t.loginSuccess);
        setPassword("");
        router.push(returnPath || "/noticias");
        return;
      }
    } catch (error) {
      setMessage(error?.message || t.errorGeneric);
      setIsLoading(false);
    }
  }

  return (
    <main className="fixed inset-0 z-[9999] overflow-y-auto bg-[rgba(27,9,9,0.28)] text-[#1b0909]">
      <iframe
        src={backgroundPath}
        title="Lineage Bloodstock"
        className="fixed inset-0 h-full w-full border-0 opacity-95"
        aria-hidden="true"
      />

      <button
        type="button"
        onClick={handleClose}
        aria-label={t.close}
        className="fixed inset-0 z-10 cursor-default bg-[rgba(27,9,9,0.24)] backdrop-blur-[1.5px]"
      />

      <section className="relative z-20 mx-auto flex min-h-screen max-w-[430px] flex-col justify-center px-5 py-10">
        <div className="relative overflow-hidden border border-[#8b0d0d] bg-[rgba(251,246,236,0.97)] shadow-[0_28px_90px_rgba(27,9,9,0.34)]">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-1.5">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setLanguage(lang)}
                  className={`flex h-8 w-8 items-center justify-center border border-[#8b0d0d] p-0 text-center text-[9px] font-semibold uppercase tracking-[0.08em] transition ${
                    language === lang
                      ? "bg-[#8b0d0d] text-white"
                      : "bg-[#fbf6ec] text-[#8b0d0d] hover:bg-[#f2e7d6]"
                  }`}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleClose}
              aria-label={t.close}
              className="text-[24px] font-light leading-none text-[#8b0d0d] transition hover:opacity-60"
            >
              ×
            </button>
          </div>

          <div className="grid grid-cols-2 border-y border-[#8b0d0d]">
            <button
              type="button"
              onClick={() => changeMode("login")}
              className={`border-r border-[#8b0d0d] px-3 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] transition ${
                mode === "login"
                  ? "bg-[#8b0d0d] text-white"
                  : "bg-transparent text-[#8b0d0d] hover:bg-[#f2e7d6]"
              }`}
            >
              {t.loginTab}
            </button>

            <button
              type="button"
              onClick={() => changeMode("create")}
              className={`px-3 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] transition ${
                mode === "create"
                  ? "bg-[#8b0d0d] text-white"
                  : "bg-transparent text-[#8b0d0d] hover:bg-[#f2e7d6]"
              }`}
            >
              {t.createTab}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6" autoComplete="off">
            {mode === "create" && (
              <>
                <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8b0d0d]">
                  {t.name}
                </label>
                <input
                  type="text"
                  name="lineage-name"
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value);
                    resetMessage();
                  }}
                  className="mb-4 w-full border border-[#8b0d0d] bg-[#f7f1e6] px-4 py-3 text-sm outline-none"
                  required
                  autoComplete="off"
                  placeholder=""
                />
              </>
            )}

            <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8b0d0d]">
              {t.email}
            </label>
            <input
              type="email"
              name="lineage-email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                resetMessage();
              }}
              className="mb-4 w-full border border-[#8b0d0d] bg-[#f7f1e6] px-4 py-3 text-sm outline-none"
              required
              autoComplete="off"
              placeholder=""
            />

            <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8b0d0d]">
              {t.password}
            </label>

            <div className="mb-4 flex w-full items-center border border-[#8b0d0d] bg-[#f7f1e6]">
              <input
                type={showPassword ? "text" : "password"}
                name="lineage-password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  resetMessage();
                }}
                className="w-full bg-transparent px-4 py-3 text-sm outline-none"
                required
                autoComplete="new-password"
                placeholder=""
              />

              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="flex h-full items-center justify-center px-3 text-[#8b0d0d] transition hover:bg-[#eadfce]"
                aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
              >
                {showPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-5 w-5"
                  >
                    <path d="M3 3l18 18" />
                    <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                    <path d="M9.5 5.4A9.3 9.3 0 0 1 12 5c5.5 0 9 7 9 7a16.7 16.7 0 0 1-2 2.9" />
                    <path d="M6.4 6.4C4.2 7.9 3 12 3 12s3.5 7 9 7a9.6 9.6 0 0 0 4.1-.9" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-5 w-5"
                  >
                    <path d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>

            {mode === "create" && (
              <>
                <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8b0d0d]">
                  {t.confirmPassword}
                </label>

                <div className="mb-5 flex w-full items-center border border-[#8b0d0d] bg-[#f7f1e6]">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="lineage-confirm-password"
                    value={confirmPassword}
                    onChange={(event) => {
                      setConfirmPassword(event.target.value);
                      resetMessage();
                    }}
                    className="w-full bg-transparent px-4 py-3 text-sm outline-none"
                    required
                    autoComplete="new-password"
                    placeholder=""
                  />

                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((current) => !current)}
                    className="flex h-full items-center justify-center px-3 text-[#8b0d0d] transition hover:bg-[#eadfce]"
                    aria-label={
                      showConfirmPassword
                        ? "Ocultar confirmación de contraseña"
                        : "Ver confirmación de contraseña"
                    }
                  >
                    {showConfirmPassword ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        className="h-5 w-5"
                      >
                        <path d="M3 3l18 18" />
                        <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                        <path d="M9.5 5.4A9.3 9.3 0 0 1 12 5c5.5 0 9 7 9 7a16.7 16.7 0 0 1-2 2.9" />
                        <path d="M6.4 6.4C4.2 7.9 3 12 3 12s3.5 7 9 7a9.6 9.6 0 0 0 4.1-.9" />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        className="h-5 w-5"
                      >
                        <path d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full border border-[#8b0d0d] bg-[#8b0d0d] px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-[#6f0909] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading && t.loading}
              {!isLoading && mode === "login" && t.loginButton}
              {!isLoading && mode === "create" && t.createButton}
            </button>

            {message && (
              <p className="mt-5 border border-[#8b0d0d] bg-[#f7f1e6] px-4 py-3 text-center text-sm leading-6 text-[#4f342c]">
                {message}
              </p>
            )}

            <div className="mt-6 text-center text-sm text-[#4f342c]">
              {mode === "login" && (
                <button
                  type="button"
                  onClick={() => changeMode("create")}
                  className="font-semibold text-[#8b0d0d]"
                >
                  {t.noAccount} {t.createLink}
                </button>
              )}

              {mode === "create" && (
                <button
                  type="button"
                  onClick={() => changeMode("login")}
                  className="font-semibold text-[#8b0d0d]"
                >
                  {t.haveAccount} {t.loginLink}
                </button>
              )}
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
