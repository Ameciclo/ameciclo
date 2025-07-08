import React, { useState } from "react";
import { Link } from "@remix-run/react";
import { motion, AnimatePresence } from "framer-motion";
import FAQIcon from "./FAQIcon";

interface FAQ {
  id: number;
  title: string;
  description: string;
  answer?: string;
}

interface Category {
  id: number;
  title: string;
  faqs: FAQ[];
}

interface AccordionItemProps {
  categories: Category;
}

export const AccordionItem = ({ categories }: AccordionItemProps) => {
  console.log('AccordionItem categories:', categories);
  const faqs = categories.faqs;
  const faqs_titles: [number, string, string, string | undefined][] = [];
  
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
        </motion.span>
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
                  <p className="p-4" key={faq[0]}>
                    <strong>P: {faq[1]}</strong>
                    <p className="pl-5"> R: {faq[2]}</p>
                  </p>
                );
                if (faq[3]) {
                  saibaMais = (
                    <Link to={`/biciclopedia/${faq[0]}`} key={faq[0]}>
                      <p className="p-4">
                        <strong>P: {faq[1]}</strong>
                        <p className="pl-5">
                          R: {faq[2]}
                          <strong className="text-ameciclo">
                            {" "}
                            (saiba mais)
                          </strong>
                        </p>
                      </p>
                    </Link>
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