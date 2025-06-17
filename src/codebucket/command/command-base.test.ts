import * as vscode from 'vscode';
import { CommandBase } from './command-base';
import { isValidUrl } from '../webviews/components/fieldValidators';

jest.mock('vscode', () => ({
    window: {
        showErrorMessage: jest.fn(),
    },
    Uri: {
        parse: jest.fn(),
    },
    env: {
        openExternal: jest.fn(),
    },
}));

jest.mock('../webviews/components/fieldValidators', () => ({
    isValidUrl: jest.fn(),
}));

class TestCommandBase extends CommandBase {
    public testOpenUrl(url: string): void {
        this.openUrl(url);
    }
}

describe('CommandBase', () => {
    let command: TestCommandBase;
    let mockShowErrorMessage: jest.Mock;
    let mockUriParse: jest.Mock;
    let mockOpenExternal: jest.Mock;
    let mockIsValidUrl: jest.Mock;

    beforeEach(() => {
        command = new TestCommandBase();
        mockShowErrorMessage = vscode.window.showErrorMessage as jest.Mock;
        mockUriParse = vscode.Uri.parse as jest.Mock;
        mockOpenExternal = vscode.env.openExternal as jest.Mock;
        mockIsValidUrl = isValidUrl as jest.Mock;

        jest.clearAllMocks();
    });

    describe('openUrl', () => {
        it('should open valid HTTPS URLs successfully', () => {
            const validUrl = 'https://bitbucket.org/owner/repo/commits/abc123#chg-file.ts';
            const mockUri = { toString: () => validUrl };
            
            mockIsValidUrl.mockReturnValue(true);
            mockUriParse.mockReturnValue(mockUri);

            command.testOpenUrl(validUrl);

            expect(mockIsValidUrl).toHaveBeenCalledWith(validUrl);
            expect(mockUriParse).toHaveBeenCalledWith(validUrl);
            expect(mockOpenExternal).toHaveBeenCalledWith(mockUri);
            expect(mockShowErrorMessage).not.toHaveBeenCalled();
        });

        it('should show error message for invalid URLs and not attempt to open', () => {
            const invalidUrl = 'not-a-valid-url';
            
            mockIsValidUrl.mockReturnValue(false);

            command.testOpenUrl(invalidUrl);

            expect(mockIsValidUrl).toHaveBeenCalledWith(invalidUrl);
            expect(mockShowErrorMessage).toHaveBeenCalledWith(`Invalid URL: ${invalidUrl}`);
            expect(mockUriParse).not.toHaveBeenCalled();
            expect(mockOpenExternal).not.toHaveBeenCalled();
        });

        it('should handle malformed URLs with special characters', () => {
            const malformedUrl = 'file+.vscode-resource.vscode-cdn.net/some/path';
            
            mockIsValidUrl.mockReturnValue(false);

            command.testOpenUrl(malformedUrl);

            expect(mockIsValidUrl).toHaveBeenCalledWith(malformedUrl);
            expect(mockShowErrorMessage).toHaveBeenCalledWith(`Invalid URL: ${malformedUrl}`);
            expect(mockUriParse).not.toHaveBeenCalled();
            expect(mockOpenExternal).not.toHaveBeenCalled();
        });

        it('should handle empty string URLs', () => {
            const emptyUrl = '';
            
            mockIsValidUrl.mockReturnValue(false);

            command.testOpenUrl(emptyUrl);

            expect(mockIsValidUrl).toHaveBeenCalledWith(emptyUrl);
            expect(mockShowErrorMessage).toHaveBeenCalledWith(`Invalid URL: ${emptyUrl}`);
            expect(mockUriParse).not.toHaveBeenCalled();
            expect(mockOpenExternal).not.toHaveBeenCalled();
        });

        it('should handle URLs with spaces', () => {
            const urlWithSpaces = 'https://example.com/path with spaces';
            
            mockIsValidUrl.mockReturnValue(false);

            command.testOpenUrl(urlWithSpaces);

            expect(mockIsValidUrl).toHaveBeenCalledWith(urlWithSpaces);
            expect(mockShowErrorMessage).toHaveBeenCalledWith(`Invalid URL: ${urlWithSpaces}`);
            expect(mockUriParse).not.toHaveBeenCalled();
            expect(mockOpenExternal).not.toHaveBeenCalled();
        });

        it('should open valid HTTP URLs successfully', () => {
            const validHttpUrl = 'http://localhost:8080/projects/PROJ/repos/repo/commits/abc123#file.ts';
            const mockUri = { toString: () => validHttpUrl };
            
            mockIsValidUrl.mockReturnValue(true);
            mockUriParse.mockReturnValue(mockUri);

            command.testOpenUrl(validHttpUrl);

            expect(mockIsValidUrl).toHaveBeenCalledWith(validHttpUrl);
            expect(mockUriParse).toHaveBeenCalledWith(validHttpUrl);
            expect(mockOpenExternal).toHaveBeenCalledWith(mockUri);
            expect(mockShowErrorMessage).not.toHaveBeenCalled();
        });

        it('should handle URLs with encoded characters', () => {
            const encodedUrl = 'https://bitbucket.org/owner/repo/commits/abc123#src%2Fpath%2Ffile.ts';
            const mockUri = { toString: () => encodedUrl };
            
            mockIsValidUrl.mockReturnValue(true);
            mockUriParse.mockReturnValue(mockUri);

            command.testOpenUrl(encodedUrl);

            expect(mockIsValidUrl).toHaveBeenCalledWith(encodedUrl);
            expect(mockUriParse).toHaveBeenCalledWith(encodedUrl);
            expect(mockOpenExternal).toHaveBeenCalledWith(mockUri);
            expect(mockShowErrorMessage).not.toHaveBeenCalled();
        });
    });
});
