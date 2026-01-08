## ft-to-inv-pkg
This is the plugin registry for ft-to-inv, a tool for syncing FreeTube and Invidious. This registry contains plugins that can be used to extend the functionality of ft-to-inv, such as generating reports, adding new features, or integrating with other services. Each plugin is defined in its own directory within the `plugins` folder, and includes a JSON file for metadata and a JavaScript file for the plugin's logic. Users can browse this registry to find and install plugins that suit their needs. Support for installing plugins is built into ft-to-inv, allowing users to easily add new functionality without needing to manually manage files. To install a plugin, users can simply run the appropriate command in ft-to-inv, and the tool will handle the download and setup process. This plugin registry is regularly updated with new plugins and improvements, so be sure to check back often for the latest additions!

## basic installation instructions
This is really simple. Simply run the following command in your terminal while in the ft-to-inv directory:

```bash
ft-to-inv install <plugin-name>
``` 
Replace `<plugin-name>` with the name of the plugin you want to install. For example, if you want to install the `report-json` plugin, you would run:

```bash
ft-to-inv install report-json
```
To uninstall a plugin, you can use the following command:

```bash
ft-to-inv remove <plugin-name>
```
Again, replace `<plugin-name>` with the name of the plugin you want to remove. This is better documented in `ft-to-inv`'s help section.

## make your own plugin
Creating your own plugin for ft-to-inv is a great way to extend its functionality and share your ideas with the community. To create a plugin, follow these steps:

1. **Setup your test environment**: Make sure you have ft-to-inv installed and set up on your machine. Simply make a folder called plugins in the root directory of ft-to-inv if it doesn't already exist. This is where you will create your plugin. OR install the `example` plugin from the plugin registry, which serves as a template for creating new plugins. Dig for this folder in the place where you ran the command or in the ft-to-inv directory (usually your global node_modules directory).
2. **Create a new plugin directory**: Inside the `plugins` folder, create a new directory for your plugin. The name of this directory will be the name of your plugin. For example, if you want to create a plugin called `my-awesome-plugin`, you would create a directory named `my-awesome-plugin`.
3. **Add a JSON file for metadata**: Inside your plugin directory, create a JSON file that will contain the metadata for your plugin. This file should be named `<plugin-name>.json`, where `<plugin-name>` is the name of your plugin. 
4. **Export a `register` function**: In the JavaScript file for your plugin, you need to export a `register` function. This function gets called by ft-to-inv when the plugin is loaded. In this function, you basically mirror the structure of your JSON file from step 3. See example for help.
5. **Implement your plugin's functionality**: ft-to-inv runs plugins with *hooks* that allow you to execute code at specific points during the sync process. Use these hooks to make your plugin work. You might want to watch the example function work to see when the hooks are triggered and how to use them effectively. Once ready, simply run the tool with your plugin installed to test it out.
6. **Open a PR** Now that your plugin works, you can share it with the community by opening a Pull Request (PR) on this repository. Make sure to include a clear description of what your plugin does, how it works, and any dependencies it might have. Once I verify that your plugin is functional and meets the necessary requirements, I will merge your PR into the main branch, making your plugin available for everyone to use. Don't forget to include any relevant documentation or usage instructions in your PR to help users understand how to install and use your plugin effectively. Sharing your plugin not only contributes to the ft-to-inv community but also allows others to benefit from your work!

written by <a href="https://github.com/riki-pedia">riki-pedia</a> and <a href="https://github.com/copilot">github copilot</a>. 

<a href="https://github.com/riki-pedia/ft-to-inv-pkg/blob/main/LICENSE">MIT License</a>