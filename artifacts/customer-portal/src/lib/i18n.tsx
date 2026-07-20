import React, { createContext, useContext, useState } from "react";

export type Lang = "pt" | "en" | "es" | "fr";

const translations = {
  pt: {
    auth: {
      title: "Origens",
      subtitle: "Portal do Cliente",
      phoneLabel: "Número Telemóvel",
      phonePlaceholder: "912 000 000",
      loginButton: "Entrar ou Registar",
      loggingIn: "A entrar...",
      welcome: "Bem-vindo(a)",
      completeRegistration: "Complete o seu registo para participar",
      fullName: "Nome Completo *",
      phone: "Telemóvel *",
      email: "Email (opcional)",
      birthDay: "Dia Nasc.",
      birthMonth: "Mês Nasc.",
      consentDataTitle: "Consentimento de dados obrigatório *",
      consentDataText: (name: string) =>
        `Autorizo o restaurante ${name} a recolher e tratar os meus dados pessoais (nome, telemóvel, email e histórico de visitas) para fins de gestão do programa de fidelização, em conformidade com o RGPD. Os dados não serão partilhados com terceiros sem o meu consentimento.`,
      consentDataRequired: "Deve aceitar o tratamento de dados para continuar.",
      consentMarketing: "Aceito receber novidades e recompensas",
      optional: "(opcional)",
      finishRegistration: "Concluir Registo",
      saving: "A guardar...",
      back: "Voltar",
      loginError: "Verifique o seu número.",
      registerError: "Tente novamente.",
      loginErrorTitle: "Erro ao entrar",
      registerErrorTitle: "Erro ao registar",
    },
    home: {
      welcome: "Bem-vindo(a)",
      maxLevel: "",
      pointsToNext: (_n: number, _tier: string) => "",
      checkIn: "Estou no restaurante",
      checkingIn: "A registar...",
      checkInHoursBreakfast: "Pequeno-almoço: 7h30–11h00 (conta ½ refeição)",
      checkInHoursDinner: "Jantar: 19h00–23h00 (conta 1 refeição)",
      checkInClosed: "Fora de Horário",
      periodBreakfast: "🌅 Pequeno-almoço · conta ½ refeição",
      periodDinner: "🌙 Jantar · conta 1 refeição",
      benefits: "Os Seus Benefícios",
      recentVisits: "Últimas Visitas",
      meals: "refeições",
      noVisits: "Sem visitas recentes.",
      logout: "Sair da conta",
      loadError: "Não foi possível carregar os dados.",
      back: "Voltar",
      checkinErrorTitle: "Erro ao registar",
      checkinErrorDesc: "Não foi possível registar a visita agora.",
      birthdayBenefit: "🎂 Hoje é o seu aniversário!",
      birthdayBenefitDesc: "Recebe a sua refeição grátis + bolo de porção individual (mín. 1 acompanhante). Fale com o staff!",
      checkInSectionTitle: "Funcionamento Aplicação Fidelidade",
    },
    checkinSuccess: {
      title: "Sucesso!",
      visitRegistered: "A sua visita foi registada.",
      points: "",
      congrats: "Parabéns!",
      levelUp: "",
      freeMealEarned: "🎉 Ganhou 50% de Desconto!",
      freeMealDesc: "Na sua próxima refeição no Restaurante, apresente este benefício ao staff para aplicar o desconto de 50%.",
      backHome: "Voltar ao Início",
    },
    notFound: {
      title: "404 Página não encontrada",
      message: "Esta página não existe.",
    },
    rewards: {
      bronze: [
        "50% de desconto na próxima refeição no Restaurante a cada 5 refeições",
        "Refeição grátis + bolo de porção individual no aniversário (mín. 1 acompanhante)",
      ],
      silver: [
        "50% de desconto na próxima refeição no Restaurante a cada 5 refeições",
        "Refeição grátis + bolo de porção individual no aniversário (mín. 1 acompanhante)",
      ],
      gold: [
        "50% de desconto na próxima refeição no Restaurante a cada 5 refeições",
        "Refeição grátis + bolo de porção individual no aniversário (mín. 1 acompanhante)",
      ],
      platinum: [
        "50% de desconto na próxima refeição no Restaurante a cada 5 refeições",
        "Refeição grátis + bolo de porção individual no aniversário (mín. 1 acompanhante)",
      ],
      vip: [
        "50% de desconto na próxima refeição no Restaurante a cada 5 refeições",
        "Refeição grátis + bolo de porção individual no aniversário (mín. 1 acompanhante)",
      ],
    },
  },
  en: {
    auth: {
      title: "Origens",
      subtitle: "Customer Portal",
      phoneLabel: "Cellphone Number",
      phonePlaceholder: "912 000 000",
      loginButton: "Login or Register",
      loggingIn: "Logging in...",
      welcome: "Welcome",
      completeRegistration: "Complete your registration to join",
      fullName: "Full Name *",
      phone: "Phone *",
      email: "Email (optional)",
      birthDay: "Birth Day",
      birthMonth: "Birth Month",
      consentDataTitle: "Data Processing Consent *",
      consentDataText: (name: string) =>
        `I authorise the restaurant ${name} to collect and process my personal data (name, phone, email and visit history) for the management of the loyalty programme, in accordance with GDPR. Data will not be shared with third parties without my consent.`,
      consentDataRequired: "You must accept data processing to continue.",
      consentMarketing: "I agree to receive news and rewards",
      optional: "(optional)",
      finishRegistration: "Complete Registration",
      saving: "Saving...",
      back: "Back",
      loginError: "Check your phone number.",
      registerError: "Please try again.",
      loginErrorTitle: "Login error",
      registerErrorTitle: "Registration error",
    },
    home: {
      welcome: "Welcome",
      maxLevel: "",
      pointsToNext: (_n: number, _tier: string) => "",
      checkIn: "I'm at the restaurant",
      checkingIn: "Checking in...",
      checkInHoursBreakfast: "Breakfast: 7:30–11:00 (counts as ½ meal)",
      checkInHoursDinner: "Dinner: 19:00–23:00 (counts as 1 meal)",
      checkInClosed: "Outside Hours",
      periodBreakfast: "🌅 Breakfast · counts as ½ meal",
      periodDinner: "🌙 Dinner · counts as 1 meal",
      benefits: "Your Benefits",
      recentVisits: "Recent Visits",
      meals: "meals",
      noVisits: "No recent visits.",
      logout: "Sign out",
      loadError: "Could not load your data.",
      back: "Back",
      checkinErrorTitle: "Check-in error",
      checkinErrorDesc: "Could not register your visit right now.",
      birthdayBenefit: "🎂 Today is your birthday!",
      birthdayBenefitDesc: "You get a free meal + individual portion birthday cake (min. 1 companion). Talk to the staff!",
      checkInSectionTitle: "Loyalty App Hours",
    },
    checkinSuccess: {
      title: "Success!",
      visitRegistered: "Your visit has been registered.",
      points: "",
      congrats: "Congratulations!",
      levelUp: "",
      freeMealEarned: "🎉 You've earned 50% Off!",
      freeMealDesc: "On your next meal at the Restaurant, show this benefit to the staff to apply the 50% discount.",
      backHome: "Back to Home",
    },
    notFound: {
      title: "404 Page Not Found",
      message: "This page does not exist.",
    },
    rewards: {
      bronze: [
        "50% discount on your next meal at the Restaurant every 5 meals",
        "Free meal + individual portion birthday cake (min. 1 companion)",
      ],
      silver: [
        "50% discount on your next meal at the Restaurant every 5 meals",
        "Free meal + individual portion birthday cake (min. 1 companion)",
      ],
      gold: [
        "50% discount on your next meal at the Restaurant every 5 meals",
        "Free meal + individual portion birthday cake (min. 1 companion)",
      ],
      platinum: [
        "50% discount on your next meal at the Restaurant every 5 meals",
        "Free meal + individual portion birthday cake (min. 1 companion)",
      ],
      vip: [
        "50% discount on your next meal at the Restaurant every 5 meals",
        "Free meal + individual portion birthday cake (min. 1 companion)",
      ],
    },
  },
  es: {
    auth: {
      title: "Origens",
      subtitle: "Portal del Cliente",
      phoneLabel: "Número de Teléfono",
      phonePlaceholder: "912 000 000",
      loginButton: "Entrar o Registrarse",
      loggingIn: "Entrando...",
      welcome: "Bienvenido/a",
      completeRegistration: "Complete su registro para participar",
      fullName: "Nombre Completo *",
      phone: "Teléfono *",
      email: "Email (opcional)",
      birthDay: "Día Nac.",
      birthMonth: "Mes Nac.",
      consentDataTitle: "Consentimiento de datos obligatorio *",
      consentDataText: (name: string) =>
        `Autorizo al restaurante ${name} a recopilar y tratar mis datos personales (nombre, teléfono, email e historial de visitas) para la gestión del programa de fidelización, de conformidad con el RGPD. Los datos no serán compartidos con terceros sin mi consentimiento.`,
      consentDataRequired: "Debe aceptar el tratamiento de datos para continuar.",
      consentMarketing: "Acepto recibir novedades y recompensas",
      optional: "(opcional)",
      finishRegistration: "Completar Registro",
      saving: "Guardando...",
      back: "Volver",
      loginError: "Verifique su número de teléfono.",
      registerError: "Por favor, inténtelo de nuevo.",
      loginErrorTitle: "Error al entrar",
      registerErrorTitle: "Error al registrarse",
    },
    home: {
      welcome: "Bienvenido/a",
      maxLevel: "",
      pointsToNext: (_n: number, _tier: string) => "",
      checkIn: "Estoy en el restaurante",
      checkingIn: "Registrando...",
      checkInHoursBreakfast: "Desayuno: 7:30–11:00 (cuenta ½ comida)",
      checkInHoursDinner: "Cena: 19:00–23:00 (cuenta 1 comida)",
      checkInClosed: "Fuera de Horario",
      periodBreakfast: "🌅 Desayuno · cuenta ½ comida",
      periodDinner: "🌙 Cena · cuenta 1 comida",
      benefits: "Sus Beneficios",
      recentVisits: "Últimas Visitas",
      meals: "comidas",
      noVisits: "Sin visitas recientes.",
      logout: "Cerrar sesión",
      loadError: "No fue posible cargar sus datos.",
      back: "Volver",
      checkinErrorTitle: "Error de check-in",
      checkinErrorDesc: "No fue posible registrar su visita ahora.",
      birthdayBenefit: "🎂 ¡Hoy es su cumpleaños!",
      birthdayBenefitDesc: "Recibe su comida gratis + tarta de porción individual (mín. 1 acompañante). ¡Hable con el personal!",
      checkInSectionTitle: "Funcionamiento App Fidelidad",
    },
    checkinSuccess: {
      title: "¡Éxito!",
      visitRegistered: "Su visita ha sido registrada.",
      points: "",
      congrats: "¡Felicitaciones!",
      levelUp: "",
      freeMealEarned: "🎉 ¡Ha ganado un 50% de Descuento!",
      freeMealDesc: "En su próxima comida en el Restaurante, muestre este beneficio al personal para aplicar el descuento del 50%.",
      backHome: "Volver al Inicio",
    },
    notFound: {
      title: "404 Página no encontrada",
      message: "Esta página no existe.",
    },
    rewards: {
      bronze: [
        "50% de descuento en su próxima comida en el Restaurante cada 5 comidas",
        "Comida gratis + tarta de porción individual (mín. 1 acompañante)",
      ],
      silver: [
        "50% de descuento en su próxima comida en el Restaurante cada 5 comidas",
        "Comida gratis + tarta de porción individual (mín. 1 acompañante)",
      ],
      gold: [
        "50% de descuento en su próxima comida en el Restaurante cada 5 comidas",
        "Comida gratis + tarta de porción individual (mín. 1 acompañante)",
      ],
      platinum: [
        "50% de descuento en su próxima comida en el Restaurante cada 5 comidas",
        "Comida gratis + tarta de porción individual (mín. 1 acompañante)",
      ],
      vip: [
        "50% de descuento en su próxima comida en el Restaurante cada 5 comidas",
        "Comida gratis + tarta de porción individual (mín. 1 acompañante)",
      ],
    },
  },
  fr: {
    auth: {
      title: "Origens",
      subtitle: "Portail Client",
      phoneLabel: "Numéro de Téléphone",
      phonePlaceholder: "912 000 000",
      loginButton: "Se connecter ou s'inscrire",
      loggingIn: "Connexion...",
      welcome: "Bienvenue",
      completeRegistration: "Complétez votre inscription pour participer",
      fullName: "Nom Complet *",
      phone: "Téléphone *",
      email: "Email (optionnel)",
      birthDay: "Jour Nais.",
      birthMonth: "Mois Nais.",
      consentDataTitle: "Consentement aux données obligatoire *",
      consentDataText: (name: string) =>
        `J'autorise le restaurant ${name} à collecter et traiter mes données personnelles (nom, téléphone, email et historique des visites) pour la gestion du programme de fidélité, conformément au RGPD. Les données ne seront pas partagées avec des tiers sans mon consentement.`,
      consentDataRequired: "Vous devez accepter le traitement des données pour continuer.",
      consentMarketing: "J'accepte de recevoir des nouvelles et des récompenses",
      optional: "(optionnel)",
      finishRegistration: "Terminer l'inscription",
      saving: "Enregistrement...",
      back: "Retour",
      loginError: "Vérifiez votre numéro de téléphone.",
      registerError: "Veuillez réessayer.",
      loginErrorTitle: "Erreur de connexion",
      registerErrorTitle: "Erreur d'inscription",
    },
    home: {
      welcome: "Bienvenue",
      maxLevel: "",
      pointsToNext: (_n: number, _tier: string) => "",
      checkIn: "Je suis au restaurant",
      checkingIn: "Enregistrement...",
      checkInHoursBreakfast: "Petit-déjeuner : 7h30–11h00 (compte ½ repas)",
      checkInHoursDinner: "Dîner : 19h00–23h00 (compte 1 repas)",
      checkInClosed: "Hors Horaires",
      periodBreakfast: "🌅 Petit-déjeuner · compte ½ repas",
      periodDinner: "🌙 Dîner · compte 1 repas",
      benefits: "Vos Avantages",
      recentVisits: "Dernières Visites",
      meals: "repas",
      noVisits: "Aucune visite récente.",
      logout: "Se déconnecter",
      loadError: "Impossible de charger vos données.",
      back: "Retour",
      checkinErrorTitle: "Erreur de check-in",
      checkinErrorDesc: "Impossible d'enregistrer votre visite pour l'instant.",
      birthdayBenefit: "🎂 Aujourd'hui c'est votre anniversaire !",
      birthdayBenefitDesc: "Vous recevez votre repas offert + gâteau de portion individuelle (min. 1 accompagnant). Parlez au personnel !",
      checkInSectionTitle: "Fonctionnement App Fidélité",
    },
    checkinSuccess: {
      title: "Succès !",
      visitRegistered: "Votre visite a été enregistrée.",
      points: "",
      congrats: "Félicitations !",
      levelUp: "",
      freeMealEarned: "🎉 Vous avez gagné 50% de Réduction !",
      freeMealDesc: "Lors de votre prochain repas au Restaurant, montrez cet avantage au personnel pour appliquer la réduction de 50%.",
      backHome: "Retour à l'accueil",
    },
    notFound: {
      title: "404 Page introuvable",
      message: "Cette page n'existe pas.",
    },
    rewards: {
      bronze: [
        "50% de réduction sur votre prochain repas au Restaurant tous les 5 repas",
        "Repas offert + gâteau de portion individuelle (min. 1 accompagnant)",
      ],
      silver: [
        "50% de réduction sur votre prochain repas au Restaurant tous les 5 repas",
        "Repas offert + gâteau de portion individuelle (min. 1 accompagnant)",
      ],
      gold: [
        "50% de réduction sur votre prochain repas au Restaurant tous les 5 repas",
        "Repas offert + gâteau de portion individuelle (min. 1 accompagnant)",
      ],
      platinum: [
        "50% de réduction sur votre prochain repas au Restaurant tous les 5 repas",
        "Repas offert + gâteau de portion individuelle (min. 1 accompagnant)",
      ],
      vip: [
        "50% de réduction sur votre prochain repas au Restaurant tous les 5 repas",
        "Repas offert + gâteau de portion individuelle (min. 1 accompagnant)",
      ],
    },
  },
} as const;

export type Translations = typeof translations.pt;

interface LangContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Translations;
}

const LangContext = createContext<LangContextValue | null>(null);

export function LangProvider({ children }: { children: React.ReactNode }) {
  const stored = (localStorage.getItem("portal_lang") as Lang) || "pt";
  const [lang, setLangState] = useState<Lang>(stored);

  const setLang = (l: Lang) => {
    localStorage.setItem("portal_lang", l);
    setLangState(l);
  };

  return (
    <LangContext.Provider value={{ lang, setLang, t: translations[lang] as unknown as Translations }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used inside LangProvider");
  return ctx;
}
