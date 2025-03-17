import React, { useState, useEffect } from "react";
import '../styles/testimonial.css';

const fetchTestimonials = async () => {
  try {
    const response = await fetch('http://localhost:5000/testimonials', {
      headers: {
        'Authorization': `Bearer ${JSON.parse(localStorage.getItem('token'))}`
      }
    });
    if (response.ok) {
      return await response.json();
    }
    throw new Error('Failed to fetch testimonials');
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
};

const Testimonial = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [expanded, setExpanded] = useState([]);
  const [newTestimonial, setNewTestimonial] = useState({ name: "", text: "" });

  useEffect(() => {
    const loadTestimonials = async () => {
      try {
        const fetchedTestimonials = await fetchTestimonials();
        setTestimonials(fetchedTestimonials);
        setExpanded(fetchedTestimonials.map(() => false));
      } catch (error) {
        console.error('Error fetching testimonials:', error);
      }
    };
    loadTestimonials();
  }, []);

  const toggleReadMore = (index) => {
    setExpanded((prevExpanded) => {
      const newExpanded = [...prevExpanded];
      newExpanded[index] = !newExpanded[index];
      return newExpanded;
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewTestimonial((prevTestimonial) => ({
      ...prevTestimonial,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/testimonials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${JSON.parse(localStorage.getItem('token'))}`,
        },
        body: JSON.stringify(newTestimonial),
      });

      if (response.ok) {
        const createdTestimonial = await response.json();
        setTestimonials([...testimonials, createdTestimonial]);
        setExpanded([...expanded, false]);
        setNewTestimonial({ name: "", text: "" });
      } else {
        const errorText = await response.text();
        console.error('Failed to create testimonial:', errorText);
        throw new Error('Failed to create testimonial');
      }
    } catch (error) {
      console.error('Error creating testimonial:', error);
    }
  };

  return (
    <div className="testimonials">
      <div className="inner">

        <h1>Testimonials</h1>
        <div className="border"></div>
        <h4 style={{ paddingTop: "10px", textAlign: "left" }}>Leave your valued suggestions!</h4>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            value={newTestimonial.name}
            onChange={handleChange}
            placeholder="Your Name"
            required
          />
          <textarea
            name="text"
            value={newTestimonial.text}
            onChange={handleChange}
            placeholder="Your Testimonial"
            required
          />
          <button type="submit" style={{ marginBottom: "20px" }}>Submit</button>
        </form>
        <div className="row testimonial-row">
          {testimonials.map((testimonial, index) => (
            <div className="col" key={index} style={{ '--i': index }}>
              <div className="testimonial">
                <div className="card-header">
                  <img
                    src="https://img.freepik.com/premium-vector/man-profile-cartoon_18591-58482.jpg"
                    alt="Profile"
                    className="user-avatar"
                  />
                  <div className="user-meta">
                    <div className="name">{testimonial.name}</div>
                    <time className="date">{testimonial.addedAt}</time>
                  </div>
                </div>
                <p className={expanded[index] ? "expanded" : ""}>
                  {testimonial.text}
                </p>
                {testimonial.text.length > 100 && (
                  <button
                    className="read-more"
                    onClick={() => toggleReadMore(index)}
                  >
                    {expanded[index] ? "Show Less" : "Read More"}
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
                      <path fill="currentColor" d={expanded[index] ? "M7 14l5-5 5 5z" : "M7 10l5 5 5-5z"} />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Testimonial;