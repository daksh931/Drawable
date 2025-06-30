'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { CreateUserSchema } from '@repo/common/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

type AuthFormData = z.infer<typeof CreateUserSchema>;

interface AuthFormProps {
  mode: 'signup' | 'login';
}

const AuthForm = ({ mode }: AuthFormProps) => {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<AuthFormData>({
    resolver: zodResolver(CreateUserSchema)
  });

  const onSubmit = async (data: AuthFormData) => {
    setLoading(true);
    try {
      const endpoint = mode === 'signup' ? 'http://localhost:3001/signup' : 'http://localhost:3001/login';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Something went wrong');

      alert(`${mode === 'signup' ? 'Signup' : 'Login'} successful!`);
    } catch (error: any) {
      alert(error.message || 'Error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center  px-4">
  <div className=" w-[50vw]  p-3 rounded-2xl bg-transparent text-black border-[1px] border-gray-900 shadow-xl"> 
    <h2 className="text-3xl font-bold text-center mb-6">
      {mode === 'signup' ? 'Create Account' : 'Welcome Back'}
    </h2>

    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {mode === 'signup' && (
        <div>
          <label className="block mb-1 text-sm text-white">Name</label>
          <input
            type="text"
            {...register('name')}
            placeholder="John Doe"
            className="w-full px-4 py-2 rounded-md bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#0a192f]"
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
        </div>
      )}

      <div>
        <label className="block mb-1 text-sm text-white">Email</label>
        <input
          type="email"
          {...register('email')}
          placeholder="you@example.com"
          className="w-full px-4 py-2 rounded-md bg-white text-black border-[1px] border-gray-400 focus:outline-none focus:ring-[1px] focus:ring-gray-700"
        />
        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
      </div>

      <div>
        <label className="block mb-1 text-sm text-white">Password</label>
        <input
          type="password"
          {...register('password')}
          placeholder="••••••••"
          className="w-full px-4 py-2 rounded-md bg-white text-black border-[1px] border-gray-400 focus:outline-none focus:ring-[1px] focus:ring-gray-700"
        />
        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#0a192f] hover:bg-white hover:text-[#0a192f] border border-[#0a192f] text-white font-semibold py-2 px-4 rounded-md transition duration-200"
      >
        {loading ? 'Please wait...' : mode === 'signup' ? 'Sign Up' : 'Login'}
      </button>
    </form>
  </div>
</div>

  );
};

export default AuthForm;
