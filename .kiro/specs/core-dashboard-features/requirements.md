# Requirements Document: Core Dashboard Features

## Introduction

This document specifies the requirements for the core dashboard features of GreenRatchet, a cloud sustainability monitoring platform. These features include the main dashboard page, audit logging system, and cloud provider connection management. The system enables organizations to track environmental metrics across multiple cloud providers (AWS, GCP, Azure) while maintaining complete auditability and security.

## Glossary

- **System**: The GreenRatchet cloud sustainability monitoring platform
- **User**: An authenticated person with access to the platform
- **Organization**: A multi-tenant entity that groups users and data
- **KPI**: Key Performance Indicator - a sustainability metric being tracked
- **Cloud_Connection**: An authenticated integration with a cloud provider (AWS, GCP, or Azure)
- **Cloud_Footprint**: Usage and emissions data collected from cloud providers
- **Audit_Log**: A record of system actions, calculations, and data changes
- **External_ID**: A secure identifier used in AWS IAM role trust relationships
- **Role_ARN**: Amazon Resource Name identifying an AWS IAM role
- **Backfill**: The process of syncing historical data from cloud providers
- **Grid_Carbon_Intensity**: Carbon emissions per unit of electricity from the power grid
- **Server_Action**: A server-side function that handles authentication and caching automatically

## Requirements

### Requirement 1: User Authentication and Authorization

**User Story:** As a user, I want secure access to the platform, so that only authorized personnel can view sustainability data.

#### Acceptance Criteria

1. WHEN a user attempts to access any dashboard page without authentication, THE System SHALL redirect them to the sign-in page
2. WHEN a user is authenticated but not a member of any organization, THE System SHALL prevent access to dashboard features
3. WHEN a user is authenticated and belongs to an organization, THE System SHALL grant access to their organization's data only
4. THE System SHALL isolate data between organizations to prevent cross-tenant data access

### Requirement 2: Dashboard Overview Display

**User Story:** As a user, I want to see a summary of my organization's sustainability tracking, so that I can quickly understand our monitoring status.

#### Acceptance Criteria

1. WHEN a user accesses the dashboard page, THE System SHALL display a welcome message containing the user's name
2. WHEN the dashboard loads, THE System SHALL display the total count of KPIs tracked by the organization
3. WHEN the dashboard loads, THE System SHALL display the count of active cloud connections for the organization
4. WHEN the organization has KPIs, THE System SHALL display up to 5 most recent KPIs with their name, type, target value, and unit
5. WHEN the organization has no KPIs, THE System SHALL display an empty state with a call-to-action to create a KPI
6. THE System SHALL cache dashboard data with 60-second revalidation to optimize performance
7. WHEN a user clicks on a KPI in the recent list, THE System SHALL navigate to the analytics page for that KPI

### Requirement 3: Audit Log Recording

**User Story:** As a compliance officer, I want complete audit trails of all system actions, so that I can demonstrate accountability and track changes.

#### Acceptance Criteria

1. WHEN a KPI is created, THE System SHALL record an audit log entry with action type KPI_CREATED
2. WHEN a KPI calculation completes, THE System SHALL record an audit log entry with action type KPI_CALCULATED
3. WHEN a cloud connection is established, THE System SHALL record an audit log entry with action type CLOUD_CONNECTION_CREATED
4. WHEN a cloud connection is removed, THE System SHALL record an audit log entry with action type CLOUD_CONNECTION_DISCONNECTED
5. WHEN a cloud backfill is triggered, THE System SHALL record an audit log entry with action type CLOUD_BACKFILL_TRIGGERED
6. THE System SHALL store the user identifier for user-initiated actions in audit logs
7. THE System SHALL mark system-initiated actions with a system identifier in audit logs
8. THE System SHALL store action details as structured data in audit logs
9. THE System SHALL record timestamps for all audit log entries

### Requirement 4: Audit Log Display

**User Story:** As a user, I want to view audit logs, so that I can track what actions have been performed in the system.

#### Acceptance Criteria

1. WHEN a user accesses the audit logs page, THE System SHALL display up to 100 most recent audit log entries for their organization
2. WHEN displaying audit logs, THE System SHALL show the action type with color-coded badges
3. WHEN displaying audit logs, THE System SHALL show the entity affected by the action
4. WHEN displaying audit logs, THE System SHALL show the user who performed the action or indicate system actions
5. WHEN displaying audit logs, THE System SHALL parse and format JSON details for readable display
6. WHEN displaying audit logs, THE System SHALL show timestamps in a human-readable format
7. WHEN no audit logs exist for the organization, THE System SHALL display an empty state message
8. THE System SHALL display an informational card explaining auditability features

### Requirement 5: Cloud Provider Connection Management

**User Story:** As a cloud operations team member, I want to connect cloud provider accounts, so that the system can automatically collect sustainability data.

#### Acceptance Criteria

1. WHEN a user accesses the cloud connections page, THE System SHALL display all supported cloud providers (AWS, GCP, Azure)
2. WHEN a cloud provider is connected, THE System SHALL display connection status, details, and last sync time
3. WHEN a cloud provider is not connected, THE System SHALL display a connection button or dialog
4. WHEN a user initiates AWS connection, THE System SHALL generate a secure External ID
5. WHEN a user initiates AWS connection, THE System SHALL provide a CloudFormation stack launch link with pre-filled parameters
6. WHEN a user completes AWS CloudFormation stack creation, THE System SHALL accept the Role ARN as input
7. WHEN a Role ARN is provided, THE System SHALL validate the AWS connection before storing it
8. WHEN a user requests to disconnect a cloud provider, THE System SHALL remove the connection and record an audit log
9. WHEN GCP or Azure connection is requested, THE System SHALL display a coming soon message
10. THE System SHALL display informational cards explaining automated ESG data collection benefits
11. THE System SHALL display informational cards explaining carbon calculation methodology

### Requirement 6: Cloud Data Backfill

**User Story:** As a user, I want to sync historical cloud data, so that I can analyze past sustainability metrics.

#### Acceptance Criteria

1. WHEN a cloud connection is established, THE System SHALL provide a backfill functionality option
2. WHEN a user triggers backfill, THE System SHALL sync up to 1 year of historical data from the cloud provider
3. WHEN backfill is triggered, THE System SHALL record an audit log entry
4. WHEN backfill completes, THE System SHALL update the last sync time for the connection

### Requirement 7: AWS Security Integration

**User Story:** As a security officer, I want secure cloud provider connections, so that credentials are protected and access is limited.

#### Acceptance Criteria

1. THE System SHALL use AWS IAM roles with External ID for AWS connections
2. THE System SHALL request read-only access to AWS CloudWatch and Cost Explorer APIs
3. THE System SHALL validate that the provided Role ARN grants necessary permissions before accepting the connection
4. THE System SHALL store cloud provider credentials securely in the database

### Requirement 8: Data Caching and Performance

**User Story:** As a user, I want fast page loads, so that I can efficiently navigate the platform.

#### Acceptance Criteria

1. THE System SHALL cache server action results for 5 minutes using the withServerAction wrapper
2. THE System SHALL cache dashboard data with 60-second revalidation
3. THE System SHALL use Prisma aggregations for calculating totals instead of in-memory calculations
4. WHEN multiple independent data queries are needed, THE System SHALL execute them in parallel using Promise.all

### Requirement 9: Responsive Design and Accessibility

**User Story:** As a user on various devices, I want the interface to work well on mobile, tablet, and desktop, so that I can access the platform anywhere.

#### Acceptance Criteria

1. THE System SHALL render all dashboard pages responsively for mobile, tablet, and desktop screen sizes
2. THE System SHALL support both light and dark modes using semantic color tokens
3. THE System SHALL meet accessibility compliance standards for all interactive elements
4. WHEN loading data, THE System SHALL display loading states to provide user feedback
5. WHEN errors occur, THE System SHALL display user-friendly error messages

### Requirement 10: External Data Integration

**User Story:** As a system administrator, I want the platform to integrate with external services, so that carbon calculations are accurate and up-to-date.

#### Acceptance Criteria

1. THE System SHALL integrate with Electricity Maps API to retrieve grid carbon intensity data
2. THE System SHALL integrate with AWS CloudWatch to retrieve usage metrics
3. THE System SHALL integrate with AWS Cost Explorer to retrieve cost and usage data
4. THE System SHALL call the footprint calculation service endpoint to compute carbon emissions
5. WHEN external API calls fail, THE System SHALL handle errors gracefully and log the failure
