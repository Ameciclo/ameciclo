import React, { createContext, useContext, useState } from "react";

const TabContext = createContext({
  activeTab: undefined,
  changeTab(name: any) {
    //
  },
});

const Tabs = (props) => {
  const { initialValue, children } = props;

  const [activeTab, changeTab] = useState(initialValue);
  const tabProviderValue = { activeTab, changeTab };

  return (
    <TabContext.Provider value={tabProviderValue}>
      <div className="tabs">{children}</div>
    </TabContext.Provider>
  );
};

const TabsNav = (props) => {
  const { children } = props;
  return (
    <div className="bg-white shadow-xl">
      <nav className="flex flex-row items-center justify-around">
        {children}
      </nav>
    </div>
  );
};

const Tab = (props) => {
  const { name, onClick = () => {}, children, disabled } = props;
  const tabContext = useContext(TabContext);

  const handleClick = (event) => {
    tabContext.changeTab(name);
    onClick(event);
  };

  return (
    <button
      className={
        "text-xs lg:text-base w-full text-gray-600 py-4 px-6 block uppercase outline-none focus:outline-none " +
        (disabled ? "cursor-default " : "hover:text-ameciclo") +
        (tabContext.activeTab === name
          ? " text-ameciclo border-ameciclo border-b-2"
          : "")
      }
      disabled={disabled}
      onClick={handleClick}
    >
      {children}
    </button>
  );
};

function TabPanel(props) {
  const { name, children } = props;

  const tabContext = useContext(TabContext);

  return (
    tabContext.activeTab === name && (
      <section
        className="container my-12 mx-auto"
        style={{ minHeight: "482px" }}
      >
        <div className="flex flex-wrap mx-3 overflow-hidden justify-center">
          {children}
        </div>
      </section>
    )
  );
}

export { Tabs, Tab, TabPanel, TabsNav };
