# MarsRover

火星车收到的指令分为四类:

- 探索区域信息：告知火星车，整片区域的长度（X）和宽度（Y）有多大
- 初始化信息：火星车的降落地点（x, y）和朝向（N, S, E, W）信息
- 移动指令：火星车可以前进（f）或后退（b）
- 转向指令：火星车可以左转90度（l）或右转90度（r）

由于地球和火星之间的距离很远，指令必须批量发送，火星车执行完整批指令之后，再回报自己所在的位置坐标和朝向。

# The Mars Rover Kata
[DanilSuits/mars-rover-kata: TDD using the Thoughtworks mars-rover problem](https://github.com/DanilSuits/mars-rover-kata)

Research suggests that the original version of this problem was part of the Thoughtworks interview loop as far back as 2007. I haven't been able to find an authoritative source, but the consensus view seems to be that the form was something like what follows below.

# Problem

A squad of robotic rovers are to be landed by NASA on a plateau on Mars. This plateau, which is curiously rectangular, must be navigated by the rovers so that their on-board cameras can get a complete view of the surrounding terrain to send back to Earth.

A rover's position and location is represented by a combination of x and y co-ordinates and a letter representing one of the four cardinal compass points. The plateau is divided up into a grid to simplify navigation. An example position might be 0, 0, N, which means the rover is in the bottom left corner and facing North.

In order to control a rover, NASA sends a simple string of letters. The possible letters are 'L', 'R' and 'M'. 'L' and 'R' makes the rover spin 90 degrees left or right respectively, without moving from its current spot. 'M' means move forward one grid point, and maintain the same heading.

Assume that the square directly North from (x, y) is (x, y+1).

# INPUT:

The first line of input is the upper-right coordinates of the plateau, the lower-left coordinates are assumed to be 0,0.

The rest of the input is information pertaining to the rovers that have been deployed. Each rover has two lines of input. The first line gives the rover's position, and the second line is a series of instructions telling the rover how to explore the plateau. The position is made up of two integers and a letter separated by spaces, corresponding to the x and y co-ordinates and the rover's orientation.

Each rover will be finished sequentially, which means that the second rover won't start to move until the first one has finished moving.

# OUTPUT:

The output for each rover should be its final co-ordinates and heading.

EXAMPLE:

Test Input:

```
5 5
1 2 N
LMLMLMLMM
3 3 E
MMRMMRMRRM
```

Expected Output:

```
1 3 N
5 1 E
```