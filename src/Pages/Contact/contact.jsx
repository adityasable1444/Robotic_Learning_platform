import React from "react";
import "./Contact.css";

const Contact = () => {
  return (
    <div className="contact-container">
      <h1>Contact Us</h1>
      <div className="contact-details">
        <div className="contact1">
        <p><strong>Name:</strong> Aditya Sable</p>
        <p><strong>Phone:</strong> +91 9765380042</p>
        </div>
        <div className="contact2">
            <p><strong>Name:</strong> Hitarth Bhatt</p>
            <p><strong>Phone:</strong> +91 1234567890</p>
        </div>
      </div>
    </div>
  );
};

export default Contact;
