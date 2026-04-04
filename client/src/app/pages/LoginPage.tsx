import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Car, Loader2 } from 'lucide-react';
import { API_URL } from '../config';
import { useUserContext } from '../context/UserContext';

export default function LoginPage() {
  const { login } = useUserContext();

  const [email, setEmail] = useState('requestor@example.com');
  const [password, setPassword] = useState('Password123');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setIsLoading(true);

      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Login failed');
      }

      const user = await response.json();

      login({
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        roleCode: user.roleCode,
        regionCode: user.regionCode,
      });
    } catch (error: any) {
      console.error('Login error:', error);
      alert(error?.message || 'Could not log in');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Card className="border-2 shadow-sm">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Car className="w-8 h-8 text-white" />
            </div>

            <CardTitle className="text-2xl">Sign In</CardTitle>
            <CardDescription>
              Log in to access the Motor Claims workflow
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="requestor@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password123"
              />
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-900 mb-2">
                Demo accounts
              </p>
              <div className="space-y-1 text-xs text-slate-600">
                <p>requestor@example.com</p>
                <p>finance.member.ruh@example.com</p>
                <p>finance.supervisor.ruh@example.com</p>
                <p>admin@example.com</p>
                <p className="pt-2 font-medium">Password: Password123</p>
              </div>
            </div>

            <Button
              onClick={handleLogin}
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}