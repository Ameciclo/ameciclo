import { motion } from "framer-motion";
import { ReactNode } from "react";

interface ParticipationCardProps {
  icon: ReactNode;
  description: string;
  items: string[];
  buttonText: string;
  buttonHref?: string;
  buttonOnClick?: () => void;
  darkMode: boolean;
  fontSize?: number;
  gradientFrom: string;
  gradientTo: string;
  borderColor: string;
}

export function ParticipationCard({
  icon,
  description,
  items,
  buttonText,
  buttonHref,
  buttonOnClick,
  darkMode,
  fontSize = 16,
  gradientFrom,
  gradientTo,
  borderColor
}: ParticipationCardProps) {
  const ButtonComponent = buttonHref ? "a" : "button";
  const buttonProps = buttonHref
    ? { href: buttonHref, target: "_blank", rel: "noopener noreferrer" }
    : { onClick: buttonOnClick, type: "button" as const };

  return (
    <motion.div
      className={`border-2 rounded-xl shadow-lg p-8 text-center hover:shadow-2xl transition-all duration-300 ${
        darkMode
          ? "bg-gradient-to-br from-gray-800 to-gray-700 border-gray-600"
          : `bg-gradient-to-br ${gradientFrom} ${gradientTo} ${borderColor}`
      }`}
      whileHover={{ scale: 1.02, y: -5 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-center mb-4">
        <div className="w-40 h-40 bg-ameciclo rounded-md flex items-center justify-center">
          <div className="w-32 h-32 text-white">{icon}</div>
        </div>
      </div>

      <p className={`${darkMode ? "text-gray-200" : "text-gray-600"} mb-6`}>
        {description}
      </p>

      <div className="bg-white/70 rounded-lg p-4 mb-6">
        <ul className={`text-left space-y-2 text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
          {items.map((item, index) => (
            <li key={index} style={{ fontSize: `${fontSize}px` }}>
              {item}
            </li>
          ))}
        </ul>
      </div>

      <ButtonComponent
        {...buttonProps}
        className="bg-ameciclo text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors w-full font-semibold inline-block"
      >
        {buttonText}
      </ButtonComponent>
    </motion.div>
  );
}
