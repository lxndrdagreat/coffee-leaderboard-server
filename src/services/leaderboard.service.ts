import { getUserCollection } from './user-profile.service';
import { LeaderboardModel } from '../schemas/leaderboard.model';

interface LeaderboardAggregation {
  userName: string;
  all: number;
  week: number;
  today: number;
}

function getWeekStart(date?: Date): Date {
  if (!date) {
    date = new Date();
  }
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate() - date.getDay(),
    0,
    0,
    0
  );
}

function getDayStart(date?: Date): Date {
  if (!date) {
    date = new Date();
  }
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
}

export async function getLeaderboard(): Promise<LeaderboardModel> {
  const data = await (await getUserCollection())
    .aggregate<LeaderboardAggregation>([
      {
        $lookup: {
          from: 'entries',
          localField: '_id',
          foreignField: 'user',
          as: 'all'
        }
      },

      // Week
      {
        $lookup: {
          from: 'entries',
          as: 'week',
          let: {
            userId: '$_id' // localfield
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: [
                        '$user', // foreignField
                        '$$userId' // localField
                      ]
                    },
                    {
                      $gte: ['$date', getWeekStart()]
                    }
                  ]
                }
              }
            }
          ]
        }
      },

      // Today
      {
        $lookup: {
          from: 'entries',
          as: 'today',
          let: {
            userId: '$_id' // localfield
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: [
                        '$user', // foreignField
                        '$$userId' // localField
                      ]
                    },
                    {
                      $gte: ['$date', getDayStart()]
                    }
                  ]
                }
              }
            }
          ]
        }
      },

      {
        $project: {
          _id: 0,
          userName: 1,
          all: {
            $size: '$all'
          },
          week: {
            $size: '$week'
          },
          today: {
            $size: '$today'
          }
        }
      }
    ])
    .toArray();

  return {
    all: data
      .map((info) => {
        return {
          userName: info.userName,
          count: info.all
        };
      })
      .filter((info) => info.count > 0),

    today: data
      .map((info) => {
        return {
          userName: info.userName,
          count: info.today
        };
      })
      .filter((info) => info.count > 0),

    week: data
      .map((info) => {
        return {
          userName: info.userName,
          count: info.week
        };
      })
      .filter((info) => info.count > 0)
  };
}
