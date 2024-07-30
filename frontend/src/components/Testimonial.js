import React, { useState, useEffect } from "react";

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

        <div className="row">
          {testimonials.map((testimonial, index) => (
            <div className="col" key={index}>
              <div className="testimonial">
                <img
                  src="https://img.freepik.com/premium-vector/man-profile-cartoon_18591-58482.jpg"
                  alt="Profile"
                />
                <div className="name">{testimonial.name}</div>
                <p className={expanded[index] ? "expanded" : ""}>
                  {testimonial.text}
                </p>
                {testimonial.text.length > 100 && (
                  <div
                    className="read-more"
                    onClick={() => toggleReadMore(index)}
                  >
                    {expanded[index] ? "Read Less..." : "Read More..."}
                  </div>
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