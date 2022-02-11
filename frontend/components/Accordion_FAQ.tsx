import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import FAQIcon from "../components/Icons/faq_new";

export const AccordionItem = ({ categories }) => {
  const faqs = categories.faqs;
  const faqs_titles = [];
  faqs.forEach((faq) => {
    faqs_titles.push([faq.id, faq.title, faq.description, faq.answer]);
  });

  faqs_titles.sort((a, b) => {
    return a[1].localeCompare(b[1]);
  });

  const [isOpen, toggleIsOpen] = useState(false);

  return (
    <div className="w-full overflow-hidden border-t tab">
      <div
        className="flex flex-row items-center pl-5"
        onClick={() => {
          toggleIsOpen(!isOpen);
        }}
        onKeyDown={() => {
          toggleIsOpen(!isOpen);
        }}
        role="button"
        tabIndex={0}
      >
        <motion.span
          className="text-ameciclo"
          animate={isOpen ? "open" : "closed"}
          variants={{
            open: { rotate: 90, opacity: 0.7 },
            closed: { rotate: 0, opacity: 1 },
          }}
          transition={{ duration: 0.8, ease: [0.04, 0.62, 0.23, 0.98] }}
        >
          <FAQIcon />
          {/* <svg viewBox="0 0 512 512" className="fill-current">
            <defs />
            <path d="M509.121 125.966c-3.838-3.838-10.055-3.838-13.893 0L256.005 365.194 16.771 125.966c-3.838-3.838-10.055-3.838-13.893 0-3.838 3.838-3.838 10.055 0 13.893l246.18 246.175c1.842 1.842 4.337 2.878 6.947 2.878 2.61 0 5.104-1.036 6.946-2.878l246.17-246.175c3.838-3.838 3.838-10.055 0-13.893z" />
        </svg> */}
        </motion.span>
        {/*<FAQIcon />*/}
        <motion.label
          initial={false}
          className="block p-5 text-xl leading-normal cursor-pointer text-ameciclo"
        >
          {categories.title}
        </motion.label>
      </div>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            className="overflow-hidden leading-normal bg-gray-100 border-l-2 border-red-500 tab-content"
            initial="collapsed"
            animate="open"
            exit="collapsed"
            variants={{
              open: { opacity: 1, height: "auto" },
              collapsed: { opacity: 0, height: 0 },
            }}
            transition={{ duration: 0.8, ease: [0.04, 0.62, 0.23, 0.98] }}
          >
            <ul>
              {faqs_titles.map((faq) => {
                let saibaMais = (
                  <p className="p-4">
                    {" "}
                    <strong>P: {faq[1]}</strong>
                    <p className="pl-5"> R: {faq[2]}</p>
                  </p>
                );
                if (faq[3]) {
                  saibaMais = (
                    <a href={`/biciclopedia/${faq[0]}`}>
                      <p className="p-4">
                        {" "}
                        <strong>P: {faq[1]}</strong>
                        <p className="pl-5">
                          {" "}
                          R: {faq[2]}
                          <strong className="text-ameciclo">
                            {" "}
                            (saiba mais)
                          </strong>
                        </p>
                      </p>
                    </a>
                  );
                }
                return saibaMais;
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const Accordion = ({ faqs }) => {
  return (
    <div className="shadow-md">
      {faqs.map((faq) => (
        <AccordionItem categories={faq} key={faq.id} />
      ))}
    </div>
  );
};
