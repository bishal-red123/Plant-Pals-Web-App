import { Plant, FileText, Truck } from "lucide-react";

const features = [
  {
    icon: <Plant className="text-xl text-primary" />,
    title: "Expert-Vetted Plants",
    description: "All plants are selected by experts for their ability to thrive in office environments."
  },
  {
    icon: <FileText className="text-xl text-primary" />,
    title: "Detailed Care Guides",
    description: "Easy-to-follow maintenance instructions tailored for busy office environments."
  },
  {
    icon: <Truck className="text-xl text-primary" />,
    title: "Reliable Delivery",
    description: "Track your order from vendor to office with real-time notifications."
  }
];

const FeaturesSection = () => {
  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-montserrat text-2xl md:text-3xl font-bold text-foreground mb-2">Why Choose GreenSpace</h2>
          <p className="font-lato text-gray-600 max-w-2xl mx-auto">The complete platform for bringing natural elements into your workspace</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-background rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              <div className="bg-primary bg-opacity-10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="font-montserrat font-semibold text-xl mb-2">{feature.title}</h3>
              <p className="font-lato text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
