# OAuth & 2FA Setup Guide

> Este documento descreve como configurar Google OAuth, GitHub OAuth e 2FA (TOTP) no Supabase para o sistema Leadgers Platform.

## 1. Google OAuth Setup

1.  Acesse o [Google Cloud Console](https://console.cloud.google.com/).
2.  Crie um novo projeto ou selecione um existente.
3.  Vá em **APIs & Services > Credentials**.
4.  Configure a **OAuth Consent Screen** (Externo).
5.  Crie um **OAuth 2.0 Client ID** (Web Application).
6.  Adicione as URIs de redirecionamento do Supabase (ex: `https://[PROJECT_ID].supabase.co/auth/v1/callback`).

## 2. GitHub OAuth Setup

1.  Vá em **Settings > Developer settings > OAuth Apps** no GitHub.
2.  Crie uma nova **GitHub App** ou **OAuth App**.
3.  Configure a **Homepage URL** e **Authorization callback URL**.

## 3. Two-Factor Authentication (2FA)

O Leadgers Platform suporta TOTP (Time-based One-Time Password).

- **Implementation**: Utiliza `supabase.auth.mfa` para inscrição e verificação.
- **Rules**: Usuários com permissão de `Admin` de Tenant **DEVEM** ter 2FA ativado para acessar o Painel de Governança.
