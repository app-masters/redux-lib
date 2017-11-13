# Redux-Lib


## AMActions


Setup (callbacks are the same object used with AppBoostrap.setup()).
```
 let callbacks = {
    onMinVersionNotSatifies: (version) => {
        alert("Você deve atualizar sua versão agora! Por favor recarregue a página, se a mensagem continuar, limpe o cache do navegador.");
    },
    onNewVersion: (version) => {
        alert('Bem vindo à nova versão!');
    },
    onUncaughtError: (e) => {
        Rollbar.error(e);
        alert("Houve um erro inesperado e os programadores responsáveis já foram avisados. \n\n Detalhes técnicos: " + e.message);
    }
  };

  AMActions.setup(storage, callbacks);
```

# Change Log

Check all changes on [changelog](CHANGELOG.md).