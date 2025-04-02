import { useState } from "react";
import { X, Plant } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import LoginForm from "@/components/auth/LoginForm";
import SignupForm from "@/components/auth/SignupForm";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'corporate' | 'vendor';
}

const LoginModal = ({ isOpen, onClose, type }: LoginModalProps) => {
  const [showSignup, setShowSignup] = useState(false);

  const toggleForm = () => {
    setShowSignup(!showSignup);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Plant className="text-primary text-2xl" />
            <h3 className="text-xl font-montserrat font-bold text-foreground">
              <span className="text-primary">Green</span>Space
            </h3>
          </div>
          <DialogTitle>
            {showSignup ? 
              (type === 'corporate' ? 'Corporate Sign Up' : 'Vendor Sign Up') :
              (type === 'corporate' ? 'Corporate Login' : 'Vendor Login')
            }
          </DialogTitle>
        </DialogHeader>

        {showSignup ? (
          <SignupForm userType={type} onSuccess={onClose} />
        ) : (
          <LoginForm userType={type} onSuccess={onClose} />
        )}

        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            {showSignup ? "Already have an account? " : "Don't have an account? "}
            <button 
              onClick={toggleForm}
              className="text-primary hover:text-primary/80"
            >
              {showSignup ? "Log in" : "Sign up"}
            </button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;
