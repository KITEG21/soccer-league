import { useState } from "react";
import { useAuth } from "@/shared/contexts/AuthContext";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Trophy, Lock, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ThemeToggle } from "@/shared/components/ThemeToggle";

export const LoginPage = () => {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(user, pass)) {
      navigate("/");
    } else {
      setError(true);
    }
  };

  return (
    <div className="min-h-[88vh] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-card rounded-2xl border border-border/50 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-500">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        
        <div className="text-center space-y-2 relative z-10">
          <div className="inline-flex p-4 bg-primary/10 rounded-2xl mb-4 transition-transform hover:scale-110 duration-300">
            <Trophy className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-foreground">
            SOCCER<span className="text-primary">LEAGUE</span>
          </h1>
          <p className="text-muted-foreground text-sm font-medium">
            ADMINISTRATION PORTAL
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div className="space-y-2">
            <Label htmlFor="user">Usuario</Label>
            <Input
              id="user"
              type="text"
              placeholder="Nombre de usuario"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              className="bg-background/50 h-11"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pass">Contraseña</Label>
            <div className="relative">
              <Input
                id="pass"
                type={showPass ? "text" : "password"}
                placeholder="••••••••"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                className="bg-background/50 h-11 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="text-destructive text-xs font-medium bg-destructive/10 p-3 rounded-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
              <Lock size={14} />
              Credenciales incorrectas. Intenta de nuevo.
            </div>
          )}

          <Button type="submit" className="w-full h-12 text-base font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all">
            Iniciar Sesión
          </Button>
        </form>
      </div>
      
      <div className="fixed bottom-6 right-6 z-50">
        <ThemeToggle />
      </div>
    </div>
  );
};
