import { BitbucketServerSite } from './bitbucket-server';
import { BitbucketSite } from '../../bitbucket/model';

describe('BitbucketServerSite', () => {
    let site: BitbucketServerSite;
    let mockBitbucketSite: BitbucketSite;

    beforeEach(() => {
        mockBitbucketSite = {
            details: {
                baseLinkUrl: 'https://bitbucket.company.com',
            },
            ownerSlug: 'PROJ',
            repoSlug: 'testrepo',
        } as BitbucketSite;

        site = new BitbucketServerSite(mockBitbucketSite);
    });

    describe('getChangeSetUrl', () => {
        it('should construct proper URL format for commit changeset', () => {
            const revision = 'abc123def456';
            const filePath = 'src/components/test.ts';

            const result = site.getChangeSetUrl(revision, filePath);

            expect(result).toBe('https://bitbucket.company.com/projects/PROJ/repos/testrepo/commits/abc123def456#src%2Fcomponents%2Ftest.ts');
        });

        it('should handle file paths with special characters and encode them', () => {
            const revision = 'abc123def456';
            const filePath = 'src/components/test-file.component.ts';

            const result = site.getChangeSetUrl(revision, filePath);

            expect(result).toBe('https://bitbucket.company.com/projects/PROJ/repos/testrepo/commits/abc123def456#src%2Fcomponents%2Ftest-file.component.ts');
        });

        it('should handle file paths with spaces and encode them', () => {
            const revision = 'abc123def456';
            const filePath = 'src/components/test file.ts';

            const result = site.getChangeSetUrl(revision, filePath);

            expect(result).toBe('https://bitbucket.company.com/projects/PROJ/repos/testrepo/commits/abc123def456#src%2Fcomponents%2Ftest%20file.ts');
        });

        it('should handle root level files', () => {
            const revision = 'abc123def456';
            const filePath = 'README.md';

            const result = site.getChangeSetUrl(revision, filePath);

            expect(result).toBe('https://bitbucket.company.com/projects/PROJ/repos/testrepo/commits/abc123def456#README.md');
        });

        it('should handle long revision hashes', () => {
            const revision = 'abc123def456789012345678901234567890abcd';
            const filePath = 'src/test.ts';

            const result = site.getChangeSetUrl(revision, filePath);

            expect(result).toBe('https://bitbucket.company.com/projects/PROJ/repos/testrepo/commits/abc123def456789012345678901234567890abcd#src%2Ftest.ts');
        });

        it('should construct valid URLs', () => {
            const revision = 'abc123def456';
            const filePath = 'src/components/test.ts';

            const result = site.getChangeSetUrl(revision, filePath);

            expect(() => new URL(result)).not.toThrow();
        });

        it('should handle different base URLs', () => {
            const customSite = {
                details: {
                    baseLinkUrl: 'http://localhost:7990',
                },
                ownerSlug: 'MYPROJ',
                repoSlug: 'myrepo',
            } as BitbucketSite;

            const customBitbucketSite = new BitbucketServerSite(customSite);
            const revision = 'abc123def456';
            const filePath = 'src/test.ts';

            const result = customBitbucketSite.getChangeSetUrl(revision, filePath);

            expect(result).toBe('http://localhost:7990/projects/MYPROJ/repos/myrepo/commits/abc123def456#src%2Ftest.ts');
            expect(() => new URL(result)).not.toThrow();
        });

        it('should handle file paths with forward slashes and encode them', () => {
            const revision = 'abc123def456';
            const filePath = 'src/deep/nested/path/file.ts';

            const result = site.getChangeSetUrl(revision, filePath);

            expect(result).toBe('https://bitbucket.company.com/projects/PROJ/repos/testrepo/commits/abc123def456#src%2Fdeep%2Fnested%2Fpath%2Ffile.ts');
        });

        it('should handle file paths with special URL characters', () => {
            const revision = 'abc123def456';
            const filePath = 'src/components/test&file.ts';

            const result = site.getChangeSetUrl(revision, filePath);

            expect(result).toBe('https://bitbucket.company.com/projects/PROJ/repos/testrepo/commits/abc123def456#src%2Fcomponents%2Ftest%26file.ts');
        });
    });

    describe('getSourceUrl', () => {
        it('should construct proper source URL with line ranges', () => {
            const revision = 'abc123def456';
            const filePath = 'src/components/test.ts';
            const lineRanges = ['10:15', '20:25'];

            const result = site.getSourceUrl(revision, filePath, lineRanges);

            expect(result).toBe('https://bitbucket.company.com/projects/PROJ/repos/testrepo/browse/src%2Fcomponents%2Ftest.ts?at=abc123def456#10-15,20-25');
            expect(() => new URL(result)).not.toThrow();
        });
    });

    describe('getPullRequestUrl', () => {
        it('should construct proper pull request URL', () => {
            const id = '123';
            const filePath = 'src/components/test.ts';

            const result = site.getPullRequestUrl(id, filePath);

            expect(result).toBe('https://bitbucket.company.com/projects/PROJ/repos/testrepo/pull-requests/123/diff#src%2Fcomponents%2Ftest.ts');
            expect(() => new URL(result)).not.toThrow();
        });
    });
});
