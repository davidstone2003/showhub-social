import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Check, Phone, Star } from "lucide-react";
import { cn } from "@/lib/utils";

const plans = [
  {
    id: "free",
    name: "Basic Listing",
    price: "Free",
    period: "",
    description: "Get started in the directory",
    features: ["Listed in directory", "Basic profile", "Limited content", "No contact access"],
    cta: "Get Started",
  },
  {
    id: "contacted",
    name: "Get Contacted",
    price: "$9.99",
    period: "/month",
    description: "Let buyers reach you",
    icon: Phone,
    features: ["Call, text, email", "Social links", "Contact form"],
    cta: "Enable Contact",
  },
  {
    id: "featured",
    name: "Featured Breeder",
    price: "$24.99",
    period: "/month",
    description: "Stand out in the directory",
    icon: Star,
    popular: true,
    features: ["Featured placement", "Higher search ranking", "Premium badge", "Profile analytics"],
    cta: "Get Featured",
  },
] as any[];

export default function PricingPage() {
  const [selected, setSelected] = useState("free");
  const navigate = useNavigate();

  const handleContinue = () => {
    if (selected === "free") {
      navigate("/");
    } else {
      // TODO: wire to Stripe checkout
      navigate("/");
    }
  };

  return (
    <Layout showDiscovery={false}>
      <div className="min-h-screen bg-background pb-24">
        <div className="max-w-lg mx-auto px-4 pt-10 pb-6">
          <h1 className="text-2xl font-bold text-foreground text-center">
            Choose your plan
          </h1>
          <p className="text-sm text-muted-foreground text-center mt-2">
            You can upgrade or change anytime
          </p>

          <div className="mt-8 space-y-3">
            {plans.map((plan) => {
              const isSelected = selected === plan.id;
              return (
                <button
                  key={plan.id}
                  onClick={() => setSelected(plan.id)}
                  className={cn(
                    "w-full text-left rounded-xl border-2 p-4 transition-all",
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-border bg-card hover:border-muted-foreground/30"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-foreground">
                          {plan.name}
                        </span>
                        {plan.popular && (
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                            Popular
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {plan.description}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0 ml-3">
                      <span className="text-lg font-bold text-foreground">
                        {plan.price}
                      </span>
                      {plan.period && (
                        <span className="text-xs text-muted-foreground">
                          {plan.period}
                        </span>
                      )}
                    </div>
                  </div>

                  {isSelected && (
                    <ul className="mt-3 space-y-1.5">
                      {plan.features.map((f) => (
                        <li
                          key={f}
                          className="flex items-center gap-2 text-xs text-foreground"
                        >
                          <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  )}
                </button>
              );
            })}
          </div>

          <Button
            onClick={handleContinue}
            className="w-full mt-6 h-12 rounded-xl text-base font-bold"
          >
            {plans.find((p) => p.id === selected)?.cta || "Continue"}
          </Button>

          <p className="text-[11px] text-muted-foreground text-center mt-3">
            Cancel anytime · No long-term commitment
          </p>
        </div>
      </div>
    </Layout>
  );
}
