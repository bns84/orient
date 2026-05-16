/**

 * ORIENT — React-Zugriff auf App-Services (Dependency Injection light)

 */



import React, { createContext, useContext, useEffect, useState } from 'react';

import { initOrientDataLayer } from '../../data/database';

import { createAppServices } from './createAppServices';



export type AppServices = ReturnType<typeof createAppServices>;



const AppServicesContext = createContext<AppServices | null>(null);



export function AppServicesProvider({ children }: { children: React.ReactNode }) {

  const [services, setServices] = useState<AppServices | null>(null);

  const [error, setError] = useState<string | null>(null);



  useEffect(() => {

    let cancelled = false;

    void (async () => {

      try {

        const { db } = await initOrientDataLayer();

        if (!cancelled) {

          setServices(createAppServices(db));

        }

      } catch (e) {

        if (!cancelled) {

          setError(e instanceof Error ? e.message : String(e));

        }

      }

    })();

    return () => {

      cancelled = true;

    };

  }, []);



  if (error) {

    return (

      <div

        style={{

          minHeight: '100vh',

          background: '#010208',

          color: '#d8daf0',

          display: 'flex',

          alignItems: 'center',

          justifyContent: 'center',

          padding: 24,

          textAlign: 'center',

        }}

      >

        Datenbank konnte nicht geladen werden.

        <br />

        <span style={{ fontSize: 12, opacity: 0.6 }}>{error}</span>

      </div>

    );

  }



  if (!services) {

    return (

      <div

        style={{

          minHeight: '100vh',

          background: 'var(--bg-primary, #010208)',

        }}

      />

    );

  }



  return (

    <AppServicesContext.Provider value={services}>{children}</AppServicesContext.Provider>

  );

}



export function useAppServices(): AppServices {

  const ctx = useContext(AppServicesContext);

  if (!ctx) {

    throw new Error('useAppServices must be used within AppServicesProvider');

  }

  return ctx;

}

