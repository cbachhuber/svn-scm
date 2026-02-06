import { Uri, window } from "vscode";
import { Command } from "./command";

export class Lock extends Command {
  constructor() {
    super("svn.lock");
  }

  public async execute(resourceUri?: Uri) {
    // If a URI is passed directly (e.g., from editor context menu), use it
    let uri: Uri | undefined = resourceUri;

    // Otherwise, try to get file URI from active text editor
    if (!uri) {
      uri = window.activeTextEditor?.document.uri;
    }

    // If still no URI, try to get from active tab
    // This handles binary files or files with unsupported encoding
    if (!uri) {
      const activeTab = window.tabGroups.activeTabGroup?.activeTab;
      if (activeTab?.input) {
        const input = activeTab.input as any;
        if (input.uri) {
          uri = input.uri;
        }
      }
    }

    if (!uri) {
      window.showErrorMessage("No file is currently open");
      return;
    }

    if (uri.scheme !== "file") {
      window.showErrorMessage("Can only lock files from the file system");
      return;
    }

    await this.runByRepository(uri, async (repository, resource) => {
      if (!repository) {
        return;
      }

      const path = resource.fsPath;

      try {
        await repository.lock([path]);
        window.showInformationMessage(`Successfully locked ${path}`);
      } catch (error) {
        console.log(error);
        window.showErrorMessage("Unable to lock file");
      }
    });
  }
}
