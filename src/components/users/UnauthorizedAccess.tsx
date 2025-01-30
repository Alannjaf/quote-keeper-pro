import React from 'react';

export function UnauthorizedAccess() {
  return (
    <div className="flex items-center justify-center h-[calc(100vh-200px)]">
      <div className="glass-card p-6 md:p-8 rounded-lg text-center w-full max-w-md mx-4">
        <h1 className="text-xl md:text-2xl font-bold gradient-text mb-4">
          Unauthorized Access
        </h1>
        <p className="text-muted-foreground">
          You don't have permission to view this page.
        </p>
      </div>
    </div>
  );
}