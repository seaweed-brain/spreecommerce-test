import { test } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { HomePage } from '../pages/HomePage';
import { AddBlogPage } from '../pages/AddBlogPage';
import { ProfilePage } from '../pages/ProfilePage';
import { BasePage } from '../pages/BasePage';

test('Add Blog Post_Publish_Featured', async ({ page }) => {
  test.setTimeout(120_000);

  const basePage = new BasePage(page);
  const loginPage = new LoginPage(page);
  const homePage = new HomePage(page);
  const addBlogPage = new AddBlogPage(page);
  const profilePage = new ProfilePage(page);

  // Test Data
  const defaultTitle = 'Blog #';
  const blogTitle =
    process.env.input_BlogTitle === undefined
      ? `${defaultTitle} ${Date.now()}`
      : process.env.input_BlogTitle;
  const blogSummary =
    process.env.input_BlogSummary === undefined
      ? 'Test blog summary.'
      : process.env.input_BlogSummary;
  const blogContent =
    process.env.input_blogContent === undefined
      ? 'Test blog content.'
      : process.env.input_blogContent;
  const uploadImage =
    process.env.input_blogImage === undefined ? 'testimg1.png' : process.env.input_blogImage;

  // Test Steps
  await test.step('Go to Intranet website and Sign in', async () => {
    await basePage.goto('/login/');
    await loginPage.login(process.env.USERNAME!, process.env.PASSWORD!);
    await page.waitForLoadState('domcontentloaded');
  });

  await test.step('Navigate to Add Blog Post', async () => {
    await homePage.clickProfileDetails();
    await homePage.clickToAddBlogPost();
  });

  await test.step('Post a blog', async () => {
    await addBlogPage.addBlogPost({
      imagePath: 'uploadables/' + uploadImage,
      title: blogTitle,
      summary: blogSummary,
      content: blogContent,
      toPublish: true,
      toFeature: true,
    });
    await addBlogPage.saveAndWaitForPostPage();
    await page.waitForLoadState('domcontentloaded');
  });

  await test.step('Verify if blog is posted on profile', async () => {
    await profilePage.openAllPosts();
    await profilePage.openBlogByTitle(blogTitle);
    await profilePage.verifyBlogPostedDetails(blogTitle, blogSummary, blogContent);
  });
});
