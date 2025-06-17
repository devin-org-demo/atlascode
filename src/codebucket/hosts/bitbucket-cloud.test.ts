import { BitbucketCloudSite } from './bitbucket-cloud';
import { BitbucketSite } from '../../bitbucket/model';

describe('BitbucketCloudSite', () => {
    let site: BitbucketCloudSite;
    let mockBitbucketSite: BitbucketSite;

    beforeEach(() => {
        mockBitbucketSite = {
            details: {
                baseLinkUrl: 'https://bitbucket.org',
            },
            ownerSlug: 'testowner',
            repoSlug: 'testrepo',
        } as BitbucketSite;

        site = new BitbucketCloudSite(mockBitbucketSite);
    });

    describe('getChangeSetUrl', () => {
        it('should construct proper URL format for commit changeset', () => {
            const revision = 'abc123def456';
            const filePath = 'src/components/test.ts';

            const result = site.getChangeSetUrl(revision, filePath);

            expect(result).toBe('https://bitbucket.org/testowner/testrepo/commits/abc123def456#chg-src/components/test.ts');
        });

        it('should handle file paths with special characters', () => {
            const revision = 'abc123def456';
            const filePath = 'src/components/test-file.component.ts';

            const result = site.getChangeSetUrl(revision, filePath);

            expect(result).toBe('https://bitbucket.org/testowner/testrepo/commits/abc123def456#chg-src/components/test-file.component.ts');
        });

        it('should handle file paths with spaces', () => {
            const revision = 'abc123def456';
            const filePath = 'src/components/test file.ts';

            const result = site.getChangeSetUrl(revision, filePath);

            expect(result).toBe('https://bitbucket.org/testowner/testrepo/commits/abc123def456#chg-src/components/test file.ts');
        });

        it('should handle root level files', () => {
            const revision = 'abc123def456';
            const filePath = 'README.md';

            const result = site.getChangeSetUrl(revision, filePath);

            expect(result).toBe('https://bitbucket.org/testowner/testrepo/commits/abc123def456#chg-README.md');
        });

        it('should handle long revision hashes', () => {
            const revision = 'abc123def456789012345678901234567890abcd';
            const filePath = 'src/test.ts';

            const result = site.getChangeSetUrl(revision, filePath);

            expect(result).toBe('https://bitbucket.org/testowner/testrepo/commits/abc123def456789012345678901234567890abcd#chg-src/test.ts');
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
                    baseLinkUrl: 'https://custom-bitbucket.company.com',
                },
                ownerSlug: 'myteam',
                repoSlug: 'myproject',
            } as BitbucketSite;

            const customBitbucketSite = new BitbucketCloudSite(customSite);
            const revision = 'abc123def456';
            const filePath = 'src/test.ts';

            const result = customBitbucketSite.getChangeSetUrl(revision, filePath);

            expect(result).toBe('https://custom-bitbucket.company.com/myteam/myproject/commits/abc123def456#chg-src/test.ts');
            expect(() => new URL(result)).not.toThrow();
        });

        it('should handle file paths with forward slashes', () => {
            const revision = 'abc123def456';
            const filePath = 'src/deep/nested/path/file.ts';

            const result = site.getChangeSetUrl(revision, filePath);

            expect(result).toBe('https://bitbucket.org/testowner/testrepo/commits/abc123def456#chg-src/deep/nested/path/file.ts');
        });
    });

    describe('getSourceUrl', () => {
        it('should construct proper source URL with line ranges', () => {
            const revision = 'abc123def456';
            const filePath = 'src/components/test.ts';
            const lineRanges = ['10:15', '20:25'];

            const result = site.getSourceUrl(revision, filePath, lineRanges);

            expect(result).toBe('https://bitbucket.org/testowner/testrepo/src/abc123def456/src/components/test.ts#test.ts-10:15,20:25');
            expect(() => new URL(result)).not.toThrow();
        });
    });

    describe('getPullRequestUrl', () => {
        it('should construct proper pull request URL', () => {
            const id = '123';
            const filePath = 'src/components/test.ts';

            const result = site.getPullRequestUrl(id, filePath);

            expect(result).toBe('https://bitbucket.org/testowner/testrepo/pull-requests/123/diff#chg-src/components/test.ts');
            expect(() => new URL(result)).not.toThrow();
        });
    });
});
