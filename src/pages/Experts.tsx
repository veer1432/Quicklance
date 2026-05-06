import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Search, Filter, Star, Zap, CheckCircle2, ArrowRight, MessageSquare, Video, Lock, Phone, Calendar } from "lucide-react";
import { motion } from "motion/react";
import { CATEGORIES, UserProfile } from "@/src/types";
import { Card } from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";
import { db, handleFirestoreError, OperationType } from "@/src/firebase";
import { collection, query, where, onSnapshot, limit } from "firebase/firestore";
import { useFirebase } from "@/src/contexts/FirebaseContext";
import { useCurrency } from "@/src/contexts/CurrencyContext";

export default function Experts() {
  const { category } = useParams();
  const searchParams = new URLSearchParams(window.location.search);
  const initialSearch = searchParams.get("q") || "";
  
  const { user, signIn, loading: authLoading } = useFirebase();
  const { formatPrice } = useCurrency();
  const [search, setSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [experts, setExperts] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [dynamicCategories, setDynamicCategories] = useState<string[]>([]);

  useEffect(() => {
    if (category) {
      const found = CATEGORIES.find(c => c?.toLowerCase() === category?.toLowerCase());
      if (found) setSelectedCategory(found);
    }
  }, [category]);

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const path = "users";
    const q = query(
      collection(db, path),
      where("role", "==", "expert"),
      where("status", "==", "active"),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const expertsData = snapshot.docs.map(doc => ({
        ...doc.data(),
        uid: doc.id
      })) as UserProfile[];
      
      setExperts(expertsData);
      
      const skills = new Set<string>(CATEGORIES);
      expertsData.forEach(expert => {
        expert.skills?.forEach(skill => {
          if (skill) skills.add(skill);
        });
      });
      
      setDynamicCategories(Array.from(skills).sort());
      setLoading(false);
    }, (error) => {
      // We don't necessarily handleFirestoreError if they are unauthenticated and listing public data
      // but security rules should allow reading public expert profiles.
      console.error("Expert fetch error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);


  const filteredExperts = experts.filter(expert => {
    const searchLower = (search || "").toLowerCase();
    const categoryLower = (selectedCategory || "All").toLowerCase();

    const searchTokens = searchLower.split(/\s+/).filter(t => t.length > 0);
    const matchesSearch = searchTokens.length === 0 || searchTokens.every(token => {
      const inName = (expert.displayName || "").toLowerCase().includes(token);
      const inRole = expert.role?.toLowerCase().includes(token);
      const inSkills = expert.skills?.some(s => s?.toLowerCase().includes(token));
      return inName || inRole || inSkills;
    });
    
    const matchesCategory = selectedCategory === "All" || 
                            (expert.role?.toLowerCase().includes(categoryLower)) || 
                            (expert.skills?.some(s => s?.toLowerCase().includes(categoryLower)));
    
    return matchesSearch && matchesCategory;
  });


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 sm:text-5xl">Quiklancers</h1>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">Find the right Quiklancer to unblock your project right now.</p>
          </div>
          
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search skills or names..." 
                className="h-12 w-full rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 pl-12 pr-4 text-sm text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:outline-none transition-all sm:w-64"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button variant="outline" className="h-12">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-12 flex flex-wrap gap-3">
          <button 
            onClick={() => setSelectedCategory("All")}
            className={`rounded-full px-6 py-2 text-sm font-bold transition-all ${
              selectedCategory === "All" ? "bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/40" : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 ring-1 ring-gray-200 dark:ring-gray-800"
            }`}
          >
            All
          </button>
          {dynamicCategories.map(cat => (
            <button 
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-full px-6 py-2 text-sm font-bold transition-all ${
                selectedCategory === cat ? "bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/40" : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 ring-1 ring-gray-200 dark:ring-gray-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Experts Grid */}
        {loading || authLoading ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-96 animate-pulse rounded-[2.5rem] bg-gray-200 dark:bg-gray-800" />
            ))}
          </div>
        ) : (
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.05
                }
              }
            }}
            className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
          >
            {filteredExperts.map((expert) => (
              <motion.div
                key={expert.uid}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 }
                }}
              >
                <Card className="h-full flex flex-col group overflow-hidden">
                  <div className="flex items-start justify-between mb-6">
                    <div className="relative">
                      {expert.photoURL ? (
                        <motion.img 
                          whileHover={{ scale: 1.1, rotate: 3 }}
                          src={expert.photoURL} 
                          alt={expert.displayName} 
                          className="h-20 w-20 rounded-3xl object-cover shadow-md dark:shadow-gray-950" 
                          referrerPolicy="no-referrer" 
                        />
                      ) : (
                        <motion.div 
                          whileHover={{ scale: 1.1, rotate: 3 }}
                          className="flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-2xl font-bold shadow-md dark:shadow-gray-950"
                        >
                          {(expert.displayName || "E").charAt(0)}
                        </motion.div>
                      )}
                      <div className={`absolute -bottom-1 -right-1 h-6 w-6 rounded-full border-4 border-white dark:border-gray-900 flex items-center justify-center ${
                        expert.isAvailable !== false ? 'bg-green-500' : 'bg-gray-400'
                      }`}>
                        {expert.isAvailable !== false && <Zap className="h-3 w-3 text-white fill-white" />}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center justify-end gap-2 mb-1">
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                          expert.isAvailable !== false ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                        }`}>
                          {expert.isAvailable !== false ? 'Available Now' : 'Offline'}
                        </span>
                      </div>
                      <div className="text-2xl font-black text-blue-600 dark:text-blue-400">{formatPrice(expert.hourlyRate || 250)}</div>
                      <div className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">per 30 min</div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <Link to={`/expert/${expert.uid}`} className="text-xl font-bold text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors block">{expert.displayName}</Link>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {expert.role === 'expert' ? 'Technical Quiklancer' : expert.role}
                      {expert.experience && expert.experience.length > 0 && ` • ${expert.experience.length} Exp.`}
                    </p>
                  </div>


                  <div className="flex items-center gap-2 mb-6">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-bold text-gray-900 dark:text-gray-100">{expert.rating || 5.0}</span>
                    </div>
                    <span className="text-sm text-gray-400 dark:text-gray-500">({expert.reviewCount || 0} reviews)</span>
                    <div className="ml-auto flex items-center gap-1 text-xs font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-lg">
                      <CheckCircle2 className="h-3 w-3" />
                      Verified
                    </div>
                  </div>

                  <div className="mb-8 flex flex-wrap gap-2">
                    {expert.skills?.map(skill => (
                      <span key={skill} className="rounded-xl bg-gray-50 dark:bg-gray-800 px-3 py-1 text-xs font-bold text-gray-500 dark:text-gray-400 ring-1 ring-gray-100 dark:ring-gray-800 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:ring-blue-100 dark:group-hover:ring-blue-900/30 transition-all">
                        {skill}
                      </span>
                    ))}
                  </div>

                  <div className="mt-auto space-y-3">
                    {expert.isAvailable !== false ? (
                      <Button 
                        variant="success" 
                        className="w-full h-12 rounded-xl shadow-lg shadow-green-100 dark:shadow-green-900/20" 
                        onClick={() => !user ? signIn() : window.location.href = `/expert/${expert.uid}`}
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        {!user ? "Sign in to Call" : "Call Now"}
                      </Button>
                    ) : (
                      <Button 
                        className="w-full h-12 rounded-xl shadow-lg shadow-blue-100 dark:shadow-blue-900/20"
                        onClick={() => !user ? signIn() : window.location.href = `/expert/${expert.uid}`}
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        {!user ? "Sign in to Schedule" : "Schedule Session"}
                      </Button>
                    )}
                    <div className="flex gap-3">
                      <Button variant="outline" className="flex-1 h-11 rounded-xl" asChild>
                        <Link to={`/expert/${expert.uid}`}>
                          View Profile
                        </Link>
                      </Button>
                      <Button variant="secondary" className="px-4 h-11 rounded-xl" onClick={() => !user && signIn()}>
                        <MessageSquare className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}



        {filteredExperts.length === 0 && (
          <div className="py-32 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500">
              <Search className="h-10 w-10" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">No Quiklancers found</h3>
            <p className="mt-2 text-gray-500 dark:text-gray-400">Try adjusting your search or filters to find what you're looking for.</p>
            <button 
              onClick={() => { setSearch(""); setSelectedCategory("All"); }}
              className="mt-8 font-bold text-blue-600 dark:text-blue-400 hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
