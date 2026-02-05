# File Tree: LoanApp

**Generated:** 1/30/2026, 3:14:57 PM
**Root Path:** `/home/maikol/projects2026/LoanApp`

```
├── 📁 .github
│   └── 📁 workflows
│       ├── ⚙️ lint.yml
│       └── ⚙️ tests.yml
├── 📁 app
│   ├── 📁 Actions
│   │   └── 📁 Fortify
│   │       ├── 🐘 CreateNewUser.php
│   │       └── 🐘 ResetUserPassword.php
│   ├── 📁 Concerns
│   │   ├── 🐘 PasswordValidationRules.php
│   │   └── 🐘 ProfileValidationRules.php
│   ├── 📁 Http
│   │   ├── 📁 Controllers
│   │   │   ├── 📁 Settings
│   │   │   │   ├── 🐘 PasswordController.php
│   │   │   │   ├── 🐘 ProfileController.php
│   │   │   │   └── 🐘 TwoFactorAuthenticationController.php
│   │   │   ├── 🐘 Controller.php
│   │   │   ├── 🐘 LoanController.php
│   │   │   ├── 🐘 MeetingController.php
│   │   │   ├── 🐘 MemberController.php
│   │   │   ├── 🐘 ShareController.php
│   │   │   └── 🐘 WelfareController.php
│   │   ├── 📁 Middleware
│   │   │   ├── 🐘 HandleAppearance.php
│   │   │   └── 🐘 HandleInertiaRequests.php
│   │   └── 📁 Requests
│   │       └── 📁 Settings
│   │           ├── 🐘 PasswordUpdateRequest.php
│   │           ├── 🐘 ProfileDeleteRequest.php
│   │           ├── 🐘 ProfileUpdateRequest.php
│   │           └── 🐘 TwoFactorAuthenticationRequest.php
│   ├── 📁 Models
│   │   ├── 🐘 Loan.php
│   │   ├── 🐘 LoanPayment.php
│   │   ├── 🐘 Meeting.php
│   │   ├── 🐘 Member.php
│   │   ├── 🐘 Share.php
│   │   ├── 🐘 User.php
│   │   └── 🐘 Welfare.php
│   └── 📁 Providers
│       ├── 🐘 AppServiceProvider.php
│       └── 🐘 FortifyServiceProvider.php
├── 📁 bootstrap
│   ├── 🐘 app.php
│   └── 🐘 providers.php
├── 📁 config
│   ├── 🐘 app.php
│   ├── 🐘 auth.php
│   ├── 🐘 cache.php
│   ├── 🐘 database.php
│   ├── 🐘 filesystems.php
│   ├── 🐘 fortify.php
│   ├── 🐘 inertia.php
│   ├── 🐘 logging.php
│   ├── 🐘 mail.php
│   ├── 🐘 queue.php
│   ├── 🐘 services.php
│   └── 🐘 session.php
├── 📁 database
│   ├── 📁 factories
│   │   └── 🐘 UserFactory.php
│   ├── 📁 migrations
│   │   ├── 🐘 0001_01_01_000000_create_users_table.php
│   │   ├── 🐘 0001_01_01_000001_create_cache_table.php
│   │   ├── 🐘 0001_01_01_000002_create_jobs_table.php
│   │   ├── 🐘 2025_08_26_100418_add_two_factor_columns_to_users_table.php
│   │   ├── 🐘 2026_01_19_105131_create_members_table.php
│   │   ├── 🐘 2026_01_19_105226_create_meetings_table.php
│   │   ├── 🐘 2026_01_19_105357_create_shares_table.php
│   │   ├── 🐘 2026_01_19_110102_create_welfares_table.php
│   │   ├── 🐘 2026_01_19_110159_create_loans_table.php
│   │   └── 🐘 2026_01_30_093731_create_loan_payments_table.php
│   ├── 📁 seeders
│   │   └── 🐘 DatabaseSeeder.php
│   ├── ⚙️ .gitignore
│   └── 📄 database.sqlite
├── 📁 public
│   ├── ⚙️ .htaccess
│   ├── 🖼️ apple-touch-icon.png
│   ├── 📄 favicon.ico
│   ├── 🖼️ favicon.svg
│   ├── 🐘 index.php
│   ├── 🖼️ logo.svg
│   └── 📄 robots.txt
├── 📁 resources
│   ├── 📁 css
│   │   └── 🎨 app.css
│   ├── 📁 js
│   │   ├── 📁 components
│   │   │   ├── 📁 ui
│   │   │   │   ├── 📄 alert.tsx
│   │   │   │   ├── 📄 avatar.tsx
│   │   │   │   ├── 📄 badge.tsx
│   │   │   │   ├── 📄 breadcrumb.tsx
│   │   │   │   ├── 📄 button.tsx
│   │   │   │   ├── 📄 card.tsx
│   │   │   │   ├── 📄 checkbox.tsx
│   │   │   │   ├── 📄 collapsible.tsx
│   │   │   │   ├── 📄 dialog.tsx
│   │   │   │   ├── 📄 drawer.tsx
│   │   │   │   ├── 📄 dropdown-menu.tsx
│   │   │   │   ├── 📄 icon.tsx
│   │   │   │   ├── 📄 input-otp.tsx
│   │   │   │   ├── 📄 input.tsx
│   │   │   │   ├── 📄 label.tsx
│   │   │   │   ├── 📄 navigation-menu.tsx
│   │   │   │   ├── 📄 pagination.tsx
│   │   │   │   ├── 📄 placeholder-pattern.tsx
│   │   │   │   ├── 📄 select.tsx
│   │   │   │   ├── 📄 separator.tsx
│   │   │   │   ├── 📄 sheet.tsx
│   │   │   │   ├── 📄 sidebar.tsx
│   │   │   │   ├── 📄 skeleton.tsx
│   │   │   │   ├── 📄 spinner.tsx
│   │   │   │   ├── 📄 switch.tsx
│   │   │   │   ├── 📄 table.tsx
│   │   │   │   ├── 📄 toggle-group.tsx
│   │   │   │   ├── 📄 toggle.tsx
│   │   │   │   └── 📄 tooltip.tsx
│   │   │   ├── 📄 alert-error.tsx
│   │   │   ├── 📄 app-content.tsx
│   │   │   ├── 📄 app-header.tsx
│   │   │   ├── 📄 app-logo-icon.tsx
│   │   │   ├── 📄 app-logo.tsx
│   │   │   ├── 📄 app-shell.tsx
│   │   │   ├── 📄 app-sidebar-header.tsx
│   │   │   ├── 📄 app-sidebar.tsx
│   │   │   ├── 📄 appearance-dropdown.tsx
│   │   │   ├── 📄 appearance-tabs.tsx
│   │   │   ├── 📄 breadcrumbs.tsx
│   │   │   ├── 📄 delete-user.tsx
│   │   │   ├── 📄 heading-small.tsx
│   │   │   ├── 📄 heading.tsx
│   │   │   ├── 📄 icon.tsx
│   │   │   ├── 📄 input-error.tsx
│   │   │   ├── 📄 nav-footer.tsx
│   │   │   ├── 📄 nav-main.tsx
│   │   │   ├── 📄 nav-user.tsx
│   │   │   ├── 📄 text-link.tsx
│   │   │   ├── 📄 two-factor-recovery-codes.tsx
│   │   │   ├── 📄 two-factor-setup-modal.tsx
│   │   │   ├── 📄 user-info.tsx
│   │   │   └── 📄 user-menu-content.tsx
│   │   ├── 📁 hooks
│   │   │   ├── 📄 use-active-url.ts
│   │   │   ├── 📄 use-appearance.tsx
│   │   │   ├── 📄 use-clipboard.ts
│   │   │   ├── 📄 use-initials.tsx
│   │   │   ├── 📄 use-mobile-navigation.ts
│   │   │   ├── 📄 use-mobile.tsx
│   │   │   └── 📄 use-two-factor-auth.ts
│   │   ├── 📁 layouts
│   │   │   ├── 📁 app
│   │   │   │   ├── 📄 app-header-layout.tsx
│   │   │   │   └── 📄 app-sidebar-layout.tsx
│   │   │   ├── 📁 auth
│   │   │   │   ├── 📄 auth-card-layout.tsx
│   │   │   │   ├── 📄 auth-simple-layout.tsx
│   │   │   │   └── 📄 auth-split-layout.tsx
│   │   │   ├── 📁 settings
│   │   │   │   └── 📄 layout.tsx
│   │   │   ├── 📄 app-layout.tsx
│   │   │   └── 📄 auth-layout.tsx
│   │   ├── 📁 lib
│   │   │   └── 📄 utils.ts
│   │   ├── 📁 pages
│   │   │   ├── 📁 Loans
│   │   │   │   └── 📄 Index.tsx
│   │   │   ├── 📁 Meetings
│   │   │   │   └── 📄 Index.tsx
│   │   │   ├── 📁 Members
│   │   │   │   └── 📄 Index.tsx
│   │   │   ├── 📁 Shares
│   │   │   │   └── 📄 Index.tsx
│   │   │   ├── 📁 Welfare
│   │   │   │   └── 📄 Index.tsx
│   │   │   ├── 📁 auth
│   │   │   │   ├── 📄 confirm-password.tsx
│   │   │   │   ├── 📄 forgot-password.tsx
│   │   │   │   ├── 📄 login.tsx
│   │   │   │   ├── 📄 register.tsx
│   │   │   │   ├── 📄 reset-password.tsx
│   │   │   │   ├── 📄 two-factor-challenge.tsx
│   │   │   │   └── 📄 verify-email.tsx
│   │   │   ├── 📁 settings
│   │   │   │   ├── 📄 appearance.tsx
│   │   │   │   ├── 📄 password.tsx
│   │   │   │   ├── 📄 profile.tsx
│   │   │   │   └── 📄 two-factor.tsx
│   │   │   ├── 📄 dashboard.tsx
│   │   │   └── 📄 welcome.tsx
│   │   ├── 📁 types
│   │   │   ├── 📄 index.d.ts
│   │   │   └── 📄 vite-env.d.ts
│   │   ├── 📄 app.tsx
│   │   └── 📄 ssr.tsx
│   └── 📁 views
│       └── 🐘 app.blade.php
├── 📁 routes
│   ├── 🐘 console.php
│   ├── 🐘 settings.php
│   └── 🐘 web.php
├── 📁 storage
│   ├── 📁 app
│   │   ├── 📁 private
│   │   │   └── ⚙️ .gitignore
│   │   ├── 📁 public
│   │   │   └── ⚙️ .gitignore
│   │   └── ⚙️ .gitignore
│   ├── 📁 framework
│   │   ├── 📁 sessions
│   │   │   └── ⚙️ .gitignore
│   │   ├── 📁 testing
│   │   │   └── ⚙️ .gitignore
│   │   ├── 📁 views
│   │   │   ├── ⚙️ .gitignore
│   │   │   ├── 🐘 01ad546da54a0b219a83b473280e5cf5.php
│   │   │   ├── 🐘 03c5f1ba739239c54550a4bb59df1e22.php
│   │   │   ├── 🐘 04fff251366ac93e5325178ff8342c6c.php
│   │   │   ├── 🐘 0574348f0202e8e77bff707c239eeb82.php
│   │   │   ├── 🐘 07404936e499f05431a9062dc3a6b54a.php
│   │   │   ├── 🐘 0c0bf1d07cc17ed357f732b5e0113914.php
│   │   │   ├── 🐘 0c3bff9e1b4bbfa099e2d8e69b5eb511.php
│   │   │   ├── 🐘 11623266d270131ac0886445668e0401.php
│   │   │   ├── 🐘 1200d4b055457d57117a23760062bb21.php
│   │   │   ├── 🐘 1204fac31f206f4563a5035f5150c1fa.php
│   │   │   ├── 🐘 127dbb987f7af5e065f28a16986da93b.php
│   │   │   ├── 🐘 181a4af8f46ebf6341eda5a7279c81d1.php
│   │   │   ├── 🐘 19397b96bf858654045d85e8a731e4e9.php
│   │   │   ├── 🐘 1a95d9d5a4457f0bc7f3bfa85d2c79e3.php
│   │   │   ├── 🐘 1b6714103345408529afb11fc91120d3.php
│   │   │   ├── 🐘 1c5894fc39f9e92448af53aafbc3f478.php
│   │   │   ├── 🐘 2110ef5e23d82238a6cdfe92543d6fa8.php
│   │   │   ├── 🐘 22c3d066c677319cc814608b963f7fce.php
│   │   │   ├── 🐘 2466c0790b30ae5dd3cb8246daaa7152.php
│   │   │   ├── 🐘 28ae7af2b9df8d9742e3b08c4372abd1.php
│   │   │   ├── 🐘 2eba3187a05db39500e3c9b2223389e8.php
│   │   │   ├── 🐘 3420fca56eabe5206db98b27d61e9754.php
│   │   │   ├── 🐘 36de142e0c8cedb612c29c827f5d11ab.php
│   │   │   ├── 🐘 4298b9d96fd64bb1f0b81fab9d90d292.php
│   │   │   ├── 🐘 448a080958b6f986b6f6ed201c7869ef.php
│   │   │   ├── 🐘 45825024ad45090252f56a66999c1811.php
│   │   │   ├── 🐘 48611fab91b407b2155bd29487e65a5d.php
│   │   │   ├── 🐘 4aa1d8779648c23e63a3590293a71632.php
│   │   │   ├── 🐘 4ac7aea1a24f5f8294406a882e3c6f42.php
│   │   │   ├── 🐘 4ad23d507df1c20178c046a35452f7e6.php
│   │   │   ├── 🐘 4de617cd2bd1ff70b7c4c2f33b722071.php
│   │   │   ├── 🐘 4dfacc275a60ef729f7b9b25194fdf0d.php
│   │   │   ├── 🐘 4e121b0e1e22cfdf9dccf8954c5e44ed.php
│   │   │   ├── 🐘 4fa942c2f0af1f5ae460269b077d03fe.php
│   │   │   ├── 🐘 5270e6b88506f66cf0f0379c1c4c436e.php
│   │   │   ├── 🐘 575990f8f966fd141bc683da9e2deaeb.php
│   │   │   ├── 🐘 5af3e5078ce44b00418b02328593c66d.php
│   │   │   ├── 🐘 6606bdca100027f631f09651a4e53599.php
│   │   │   ├── 🐘 6c7c3c6f9b0defed34886edfb92bc053.php
│   │   │   ├── 🐘 6d472a25cf9ae855882957669bf5e050.php
│   │   │   ├── 🐘 71f425380dd42a347f78d7ca571f7ad2.php
│   │   │   ├── 🐘 75c9d4255ab1515d379a59390b168254.php
│   │   │   ├── 🐘 78b66bcac2d8b6fe41feeeb405078972.php
│   │   │   ├── 🐘 78be253e84647546617a716477147279.php
│   │   │   ├── 🐘 79f6ca44dd4d13d3102e8ea3b9a9ca88.php
│   │   │   ├── 🐘 7a4ce25e1fa76b9acd1f5133367f0bb5.php
│   │   │   ├── 🐘 7eaa8e48c5058672b0b09923de8585a3.php
│   │   │   ├── 🐘 819cc600c564e26438f8aaba8b08540f.php
│   │   │   ├── 🐘 81ed2cf397b72b8221a337c12872e7be.php
│   │   │   ├── 🐘 8244e1a1a36da1ac6aa251ff01b3d666.php
│   │   │   ├── 🐘 85496c018f6a5823e06cd9e8a9cb2c73.php
│   │   │   ├── 🐘 882ce2352a2d5b03852d411ae322f90d.php
│   │   │   ├── 🐘 89a375817c8c126186133cff599bc7ff.php
│   │   │   ├── 🐘 8b2328290e5144538f969bd6163421ba.php
│   │   │   ├── 🐘 8b540c17a6f64ddbcfbca5e4e81208c6.php
│   │   │   ├── 🐘 8e7b723650238ec4ce9cb037b91e2243.php
│   │   │   ├── 🐘 9510c0a73f906c962a6fcd122f39119f.php
│   │   │   ├── 🐘 9862dc9312a24227cc44c366cc58600e.php
│   │   │   ├── 🐘 989bacf178f59fccb572c45c69ab4a3f.php
│   │   │   ├── 🐘 98b883634137b4e520c570ead2b1afc2.php
│   │   │   ├── 🐘 99d8cd883a6525062fb525861e8239ba.php
│   │   │   ├── 🐘 99f757a6b6bf5f8d86146891e09c5c10.php
│   │   │   ├── 🐘 9a3c59156f578c07a90ed571b17abb47.php
│   │   │   ├── 🐘 9f1608dd7ed7d7373e3c73ee9c1575c4.php
│   │   │   ├── 🐘 a6f75eafc59d5708243c7ddf81629859.php
│   │   │   ├── 🐘 a8ab992cad80c6b9c985bbba38e275ff.php
│   │   │   ├── 🐘 a9e00931d4ea53f6d10a937fa08eeb28.php
│   │   │   ├── 🐘 ac26bf1b1be1b38fa1797e9727396fd4.php
│   │   │   ├── 🐘 b5381966e5222eda5d2252953f33c096.php
│   │   │   ├── 🐘 b5c5e8c9cc59b55bbf85562aecdc2e7d.php
│   │   │   ├── 🐘 b5ddf59301f87d6808b371bccc23797d.php
│   │   │   ├── 🐘 b96ac3970ebe24d2513fedcd656bbf75.php
│   │   │   ├── 🐘 be13d73b15ed734c962842a5f92efe01.php
│   │   │   ├── 🐘 be31d5585852dfef2c662343db69a3d5.php
│   │   │   ├── 🐘 be98f54b8ef3d65ba8d22aa6b7dc2314.php
│   │   │   ├── 🐘 beaa61fdbcc57ef0a87382f5a7101eb5.php
│   │   │   ├── 🐘 bf4bf66d1dc2bf64fa1893a91470bb82.php
│   │   │   ├── 🐘 c019e3f3e422e84ecc9041064e5c844d.php
│   │   │   ├── 🐘 c6683a4314f0fc47686bbdd981c254ad.php
│   │   │   ├── 🐘 c8f063ce09b32bda1c4b4a73d1b7e22e.php
│   │   │   ├── 🐘 c963b592ce565140ce5ebea28360254c.php
│   │   │   ├── 🐘 ca33522073c938eef684383aa2ce9bab.php
│   │   │   ├── 🐘 ccda1d66695313cbe5bcc17256286b15.php
│   │   │   ├── 🐘 d0b56f7e148db04fb46d4889e41e13ae.php
│   │   │   ├── 🐘 d86082f7ee3526a8f975cf41058c3a16.php
│   │   │   ├── 🐘 da2b66c5f361f4e05a9ecb192d3a1257.php
│   │   │   ├── 🐘 db72e19e201156d6b6eae35bcecdafd8.php
│   │   │   ├── 🐘 ddc4d3997a6b2411569069281033428b.php
│   │   │   ├── 🐘 df73e0bc635661fe1a9cdfa47339c1b9.php
│   │   │   ├── 🐘 e0ec491c11eb48893753d5a38a1d6ad3.php
│   │   │   ├── 🐘 e11a28c32d8413ad08d0b887aa894c18.php
│   │   │   ├── 🐘 e270a421e7574184ba05747df7d0ce08.php
│   │   │   ├── 🐘 e2b832122478212f6fa7e49ff1f75be2.php
│   │   │   ├── 🐘 e4e125a20818f8d7ed1932a711a1b174.php
│   │   │   ├── 🐘 e530600404869a2690c58713b4bb76d0.php
│   │   │   ├── 🐘 ec83ffd9fcdec339a0507c5c2b019bcf.php
│   │   │   ├── 🐘 f26923464148256378949cbf343422ee.php
│   │   │   ├── 🐘 f5bfd1442807d38ea563d9aa35d43396.php
│   │   │   ├── 🐘 f779be9361091e840ed16bfd80a20b13.php
│   │   │   ├── 🐘 f85abf9baa7c3792bb46412a7868f486.php
│   │   │   ├── 🐘 fb0ff6e3b2aa87114e02c279e52037ea.php
│   │   │   ├── 🐘 fb5d254867db3e9506466222d4ed1634.php
│   │   │   ├── 🐘 fce67b2c5c8e5c41c00bff30c019c9dd.php
│   │   │   └── 🐘 ff87b1be499d4a8df13437a357af7e18.php
│   │   └── ⚙️ .gitignore
│   └── 📁 logs
│       └── ⚙️ .gitignore
├── 📁 tests
│   ├── 📁 Feature
│   │   ├── 📁 Auth
│   │   │   ├── 🐘 AuthenticationTest.php
│   │   │   ├── 🐘 EmailVerificationTest.php
│   │   │   ├── 🐘 PasswordConfirmationTest.php
│   │   │   ├── 🐘 PasswordResetTest.php
│   │   │   ├── 🐘 RegistrationTest.php
│   │   │   ├── 🐘 TwoFactorChallengeTest.php
│   │   │   └── 🐘 VerificationNotificationTest.php
│   │   ├── 📁 Settings
│   │   │   ├── 🐘 PasswordUpdateTest.php
│   │   │   ├── 🐘 ProfileUpdateTest.php
│   │   │   └── 🐘 TwoFactorAuthenticationTest.php
│   │   ├── 🐘 DashboardTest.php
│   │   └── 🐘 ExampleTest.php
│   ├── 📁 Unit
│   │   └── 🐘 ExampleTest.php
│   ├── 🐘 Pest.php
│   └── 🐘 TestCase.php
├── ⚙️ .editorconfig
├── ⚙️ .env.example
├── ⚙️ .gitattributes
├── ⚙️ .gitignore
├── ⚙️ .prettierignore
├── ⚙️ .prettierrc
├── 📄 artisan
├── ⚙️ components.json
├── ⚙️ composer.json
├── 📄 eslint.config.js
├── ⚙️ package-lock.json
├── ⚙️ package.json
├── ⚙️ phpunit.xml
├── ⚙️ pint.json
├── ⚙️ tsconfig.json
└── 📄 vite.config.ts
```

---
*Generated by FileTree Pro Extension*