# Test Plan

Record the actual result for each test before the showcase. Do not mark tests as passed until they have been run.

| Test ID | Area | Test steps | Expected result | Actual result |
|---|---|---|---|---|
| T-01 | Login | Log in with student demo credentials | Student dashboard opens | Not run |
| T-02 | Login | Enter incorrect password | Generic login error; no session | Not run |
| T-03 | Login | Submit blank credentials | Validation/error message | Not run |
| T-04 | Logout | Log out, then open `/bookings` directly | Redirected to login | Not run |
| T-05 | Access control | Log in as student and open `/admin` | Access denied | Not run |
| T-06 | Access control | Log in as student and open `/faculty` | Access denied | Not run |
| T-07 | Student booking | Request a consultation during an active faculty slot | Booking stored as pending | Not run |
| T-08 | Validation | Submit blank topic or invalid duration | Request rejected | Not run |
| T-09 | Availability | Request a time outside active faculty slot | Request rejected | Not run |
| T-10 | Conflict | Create overlapping pending/approved booking for same faculty | Conflicting request rejected | Not run |
| T-11 | Faculty | Approve a pending booking | Status becomes approved | Not run |
| T-12 | Faculty | Reject a pending booking | Status becomes rejected | Not run |
| T-13 | Ownership | Student attempts to cancel another student's booking by changing URL ID | No other user's booking changes | Not run |
| T-14 | Reschedule | Reschedule to valid available time | Time updates and status returns to pending | Not run |
| T-15 | Cancel | Cancel eligible future booking | Status becomes cancelled | Not run |
| T-16 | Admin | View dashboard | Counts, accounts, recent bookings display | Not run |
| T-17 | Persistence | Create booking, refresh and restart app | Booking remains in database | Not run |
| T-18 | Account access | Admin deactivates a demo account, then that user tries to log in | Login rejected | Not run |

## Evidence to capture

- Login screen and each role's dashboard.
- Student request and resulting pending booking.
- Faculty approval/rejection and updated status.
- Access-denied result for unauthorized role.
- Admin dashboard.
- GitHub branches, issues, pull requests, reviews, and commits.
- Completed test table with genuine results.
