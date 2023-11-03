module.exports = {
  packagerConfig: {
    asar: true,
    icon: 'resources/icon/logo.png'
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        setupIcon: 'resources/icon/logo_256.ico',
        icon: 'resources/icon/logo.png'
      },
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
      config: {
        icon: 'resources/icon/logo.png'
      }      
    },
    {
      name: '@electron-forge/maker-dmg',
      config: {
        icon: 'resources/icon/logo.icns'
      }
    },
    {
      name: '@electron-forge/maker-deb',
      config: {
        options: {
          icon: 'resources/icon/logo.png'
        }
      },
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {},
    },
    {
      name: '@electron-forge/maker-wix',
      config: {
        icon: 'resources/icon/logo_256.ico'
      },
    },
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {},
    },
  ],
};
