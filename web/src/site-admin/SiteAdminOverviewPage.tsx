import CityIcon from '@sourcegraph/icons/lib/City'
import GearIcon from '@sourcegraph/icons/lib/Gear'
import GlobeIcon from '@sourcegraph/icons/lib/Globe'
import Loader from '@sourcegraph/icons/lib/Loader'
import RepoIcon from '@sourcegraph/icons/lib/Repo'
import UserIcon from '@sourcegraph/icons/lib/User'
import AddIcon from 'mdi-react/AddIcon'
import * as React from 'react'
import { RouteComponentProps } from 'react-router'
import { Link } from 'react-router-dom'
import { Observable, Subscription } from 'rxjs'
import { map } from 'rxjs/operators'
import { gql, queryGraphQL } from '../backend/graphql'
import { OverviewItem, OverviewList } from '../components/Overview'
import { PageTitle } from '../components/PageTitle'
import { eventLogger } from '../tracking/eventLogger'
import { createAggregateError } from '../util/errors'
import { pluralize } from '../util/strings'
import { SourcegraphLicense } from './SourcegraphLicense'

interface Props extends RouteComponentProps<any> {}

interface State {
    info?: OverviewInfo
}

/**
 * A page displaying an overview of site admin information.
 */
export class SiteAdminOverviewPage extends React.Component<Props, State> {
    public state: State = {}

    private subscriptions = new Subscription()

    public componentDidMount(): void {
        eventLogger.logViewEvent('SiteAdminOverview')

        this.subscriptions.add(fetchOverview().subscribe(info => this.setState({ info })))
    }

    public componentWillUnmount(): void {
        this.subscriptions.unsubscribe()
    }

    public render(): JSX.Element | null {
        return (
            <div className="site-admin-overview-page">
                <PageTitle title="Overview - Admin" />
                {!this.state.info && <Loader className="icon-inline" />}
                <OverviewList>
                    {this.state.info && (
                        <OverviewItem
                            link="/site-admin/repositories"
                            icon={RepoIcon}
                            actions={
                                <>
                                    <Link to="/site-admin/configuration" className="btn btn-primary btn-sm">
                                        <GearIcon className="icon-inline" /> Configure repositories
                                    </Link>
                                    <Link to="/site-admin/repositories" className="btn btn-secondary btn-sm">
                                        View all
                                    </Link>
                                </>
                            }
                        >
                            {this.state.info.repositories}&nbsp;
                            {this.state.info.repositories !== null
                                ? pluralize('repository', this.state.info.repositories, 'repositories')
                                : '?'}
                        </OverviewItem>
                    )}
                    {this.state.info && (
                        <OverviewItem
                            link="/site-admin/users"
                            icon={UserIcon}
                            actions={
                                <>
                                    <Link to="/site-admin/users/new" className="btn btn-primary btn-sm">
                                        <AddIcon className="icon-inline" /> Create user account
                                    </Link>
                                    <Link to="/site-admin/configuration" className="btn btn-secondary btn-sm">
                                        <GearIcon className="icon-inline" /> Configure SSO
                                    </Link>
                                    <Link to="/site-admin/users" className="btn btn-secondary btn-sm">
                                        View all
                                    </Link>
                                </>
                            }
                        >
                            {this.state.info.users}&nbsp;{pluralize('user', this.state.info.users)}
                        </OverviewItem>
                    )}
                    {this.state.info && (
                        <OverviewItem
                            link="/site-admin/organizations"
                            icon={CityIcon}
                            actions={
                                <>
                                    <Link to="/organizations/new" className="btn btn-primary btn-sm">
                                        <AddIcon className="icon-inline" /> Create organization
                                    </Link>
                                    <Link to="/site-admin/organizations" className="btn btn-secondary btn-sm">
                                        View all
                                    </Link>
                                </>
                            }
                        >
                            {this.state.info.orgs}&nbsp;{pluralize('organization', this.state.info.orgs)}
                        </OverviewItem>
                    )}
                    {this.state.info &&
                        typeof this.state.info.repositories === 'number' && (
                            <OverviewItem
                                icon={GlobeIcon}
                                actions={
                                    <Link to="/site-admin/code-intelligence" className="btn btn-primary btn-sm">
                                        <GearIcon className="icon-inline" /> Manage code intelligence
                                    </Link>
                                }
                            >
                                Code intelligence is {this.state.info.hasCodeIntelligence ? 'on' : 'off'}
                            </OverviewItem>
                        )}
                </OverviewList>
                <SourcegraphLicense className="mt-5" />
            </div>
        )
    }
}

interface OverviewInfo {
    repositories: number | null
    users: number
    orgs: number
    hasCodeIntelligence: boolean
}

function fetchOverview(): Observable<OverviewInfo> {
    return queryGraphQL(gql`
        query Overview {
            repositories {
                totalCount(precise: true)
            }
            users {
                totalCount
            }
            organizations {
                totalCount
            }
            site {
                hasCodeIntelligence
            }
        }
    `).pipe(
        map(({ data, errors }) => {
            if (!data || !data.repositories || !data.users || !data.organizations) {
                throw createAggregateError(errors)
            }
            return {
                repositories: data.repositories.totalCount,
                users: data.users.totalCount,
                orgs: data.organizations.totalCount,
                hasCodeIntelligence: data.site.hasCodeIntelligence,
            }
        })
    )
}