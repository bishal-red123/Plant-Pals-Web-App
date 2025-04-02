import { Star } from "lucide-react";

const testimonials = [
  {
    text: "GreenSpace transformed our sterile office into a vibrant, living environment. Our employees love the plants, and the care guides make maintenance easy even for our busy team.",
    author: "Sarah Johnson",
    position: "Office Manager, TechCorp",
    image: "https://randomuser.me/api/portraits/women/45.jpg",
    rating: 5
  },
  {
    text: "The selection of low-maintenance plants was perfect for our busy startup. The detailed care information helped us keep everything alive, and our office looks amazing!",
    author: "Michael Chen",
    position: "CEO, Startup Innovate",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
    rating: 5
  },
  {
    text: "We've tried other services, but GreenSpace offers the best combination of quality plants, reliable vendors, and helpful care instructions. Our office feels so much more inviting now.",
    author: "Rebecca Torres",
    position: "HR Director, Global Finance",
    image: "https://randomuser.me/api/portraits/women/68.jpg",
    rating: 4.5
  }
];

const Testimonials = () => {
  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="font-montserrat text-2xl md:text-3xl font-bold text-foreground mb-2">What Our Clients Say</h2>
          <p className="font-lato text-gray-600 max-w-2xl mx-auto">Join hundreds of satisfied businesses transforming their workspaces</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-background rounded-lg p-6 shadow-md">
              <div className="flex items-center space-x-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`${i < Math.floor(testimonial.rating) 
                      ? 'fill-yellow-400 text-yellow-400' 
                      : i < testimonial.rating 
                        ? 'fill-yellow-400 text-yellow-400' 
                        : 'text-yellow-400'} h-4 w-4`}
                  />
                ))}
              </div>
              
              <p className="font-lato text-gray-700 mb-6">
                "{testimonial.text}"
              </p>
              
              <div className="flex items-center">
                <img 
                  src={testimonial.image} 
                  alt={testimonial.author} 
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div>
                  <h4 className="font-montserrat font-semibold">{testimonial.author}</h4>
                  <p className="text-sm text-gray-600">{testimonial.position}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
