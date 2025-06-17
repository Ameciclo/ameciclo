import React, { createContext, useContext, useState, ReactNode } from "react";

type TabContextType = {
    activeTab: string;
    changeTab: (name: string) => void;
};

const TabContext = createContext<TabContextType>({
    activeTab: "",
    changeTab: () => { },
});

interface TabsProps {
    initialValue: string;
    children: ReactNode;
}

const Tabs = ({ initialValue, children }: TabsProps) => {
    const [activeTab, changeTab] = useState(initialValue);
    const tabProviderValue = { activeTab, changeTab };

    return (
        <TabContext.Provider value={tabProviderValue}>
            <div className="tabs">{children}</div>
        </TabContext.Provider>
    );
};

interface TabsNavProps {
    children: ReactNode;
}

const TabsNav = ({ children }: TabsNavProps) => {
    return (
        <div className="bg-white shadow-xl">
            <nav className="flex flex-row items-center justify-around">{children}</nav>
        </div>
    );
};

interface TabProps {
    name: string;
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
    children: ReactNode;
    disabled?: boolean;
}

const Tab = ({ name, onClick = () => { }, children, disabled = false }: TabProps) => {
    const tabContext = useContext(TabContext);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        if (!disabled) {
            tabContext.changeTab(name);
            onClick(event);
        }
    };

    return (
        <button
            className={`text-xs lg:text-base w-full text-gray-600 py-4 px-6 block uppercase outline-none focus:outline-none
        ${disabled ? "cursor-default" : "hover:text-ameciclo"}
        ${tabContext.activeTab === name ? " text-ameciclo border-ameciclo border-b-2" : ""}`}
            disabled={disabled}
            onClick={handleClick}
        >
            {children}
        </button>
    );
};

interface TabPanelProps {
    name: string;
    children: ReactNode;
}

const TabPanel = ({ name, children }: TabPanelProps) => {
    const tabContext = useContext(TabContext);

    return tabContext.activeTab === name ? (
        <section className="container my-12 mx-auto" style={{ minHeight: "482px" }}>
            <div className="flex flex-wrap mx-3 overflow-hidden justify-center">{children}</div>
        </section>
    ) : null;
};

export { Tabs, Tab, TabPanel, TabsNav };
