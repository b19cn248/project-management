// src/App.tsx
import React from 'react';
import AppRouter from './router';
import { ToastProvider, ToastContainer } from './components/common/Toast';
import './App.css';

function App() {
    return (
        <ToastProvider>
            <div className="App min-h-screen bg-gray-100">
                <AppRouter />
                <ToastContainer />
            </div>
        </ToastProvider>
    );
}

export default App;