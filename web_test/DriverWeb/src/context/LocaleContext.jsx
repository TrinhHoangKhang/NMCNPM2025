import { createContext, useContext, useState } from "react";

const LocaleContext = createContext();

const translations = {
    en: {
        "welcome": "Welcome",
        "login": "Login",
        "logout": "Logout",
        "settings": "Settings"
        // Add more keys as needed
    },
    vi: {
        "welcome": "Chào mừng",
        "login": "Đăng nhập",
        "logout": "Đăng xuất",
        "settings": "Cài đặt"
    }
};

export const LocaleProvider = ({ children }) => {
    const [locale, setLocale] = useState("en");

    const t = (key) => {
        return translations[locale][key] || key;
    };

    return (
        <LocaleContext.Provider value={{ locale, setLocale, t }}>
            {children}
        </LocaleContext.Provider>
    );
};

export const useLocale = () => {
    const context = useContext(LocaleContext);
    if (!context) {
        throw new Error("useLocale must be used within a LocaleProvider");
    }
    return context;
};
