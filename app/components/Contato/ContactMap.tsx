export function ContactMap() {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <iframe
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3950.2847!2d-34.8823!3d-8.0593!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x7ab18a59c7b4b0b%3A0x123456789!2sR.%20da%20Aurora%2C%20529%20-%20Santo%20Amaro%2C%20Recife%20-%20PE!5e0!3m2!1spt-BR!2sbr!4v1234567890"
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title="Localização da Sede da Ameciclo"
      />
    </div>
  );
}
