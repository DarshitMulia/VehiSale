const Testimonial = require('../models/Testimonial');

exports.addTestimonial = async (req, res) => {
    try {
        const { name, text } = req.body;
        if (!name || !text) return res.status(400).json({ error: 'Name and text are required' });

        const newTestimonial = new Testimonial({ name, text });
        await newTestimonial.save();
        res.status(201).json(newTestimonial);
    } catch (error) {
        console.error('Error creating testimonial:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.getTestimonials = async (req, res) => {
    try {
        const testimonials = await Testimonial.find();
        if (!testimonials || testimonials.length === 0) {
            return res.status(404).json({ error: 'No testimonials found' });
        }
        res.status(200).json(testimonials);
    } catch (error) {
        console.error('Error fetching testimonials:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
