temperatures = [73, 74, 75, 71, 69, 72, 76, 73]

result = []

for i in range(len(temperatures)):
    days = 0

    for j in range(i + 1, len(temperatures)):
        if temperatures[j] > temperatures[i]:
            days = j - i
            break

    result.append(days)

print("Temperatures:", temperatures)
print("Peak Horizon:", result)
