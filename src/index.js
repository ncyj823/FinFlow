import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './data/App';
import { LangProvider } from './context/LangContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
	<LangProvider>
		<App />
	</LangProvider>
);
