import { FeaturesBento } from "@/components/features/FeaturesBento";
import { Footer } from "@/components/sections/footer";
import { Navbar } from "@/components/sections/navbar";

export default function FeaturesPage() {
  return <div className="min-h-screen overflow-hidden text-text-primary"><Navbar /><main><FeaturesBento /></main><Footer /></div>;
}
