import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import FAQIcon from "../components/Icons/faq_new";
import Link from "next/link";

const AccordionItem = ({ categories }) => {

  const faqs=categories.faqs;
  const faqs_titles = [];
  faqs.forEach(faq => {
    faqs_titles.push([faq.title, faq.description, categories.slug])
  });

  const [isOpen, toggleIsOpen] = useState(false);

  return (
    <div className="tab w-full overflow-hidden border-t">
      <div
        className="flex flex-row items-center"
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
            open: { rotate: 90, opacity: 0.8 },
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
          className="text-xl block p-5 leading-normal cursor-pointer text-ameciclo"
        >
         {categories.title}
        </motion.label>
      </div>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            className="tab-content overflow-hidden border-l-2 bg-gray-100 border-red-500 leading-normal"
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
                {faqs_titles.map((faq)=>{
                    return <a href={`/biciclopedia/${faq[2]}`}>
                      <p className="p-4"> <strong>P: {faq[0]}</strong>
                      <p className="pl-5"> R: {faq[1]} 
                      <strong className="text-xl text-ameciclo">  +++</strong>
                      </p></p></a>
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
